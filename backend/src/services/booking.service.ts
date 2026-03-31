import prisma from "../config/database";
import {BadRequestError} from "../utils/errors";
import {addEmailJob} from "../queues/emailQueue";

class BookingService {
  // check special date
  async checkSpecialDate(
    locationId: string,
    appointmentTypeId: string,
    date: Date,
    client: any = prisma,
  ) {
    const specialDate = await client.specialDate.findFirst({
      where: {
        date: date,
      },
    });

    return specialDate;
  }

  // check if a specific slot is available
  async isSlotAvailable(
    locationId: string,
    appointmentTypeId: string,
    date: string,
    time: string,
    client: any = prisma,
  ): Promise<boolean> {
    // Get global slot configuration
    const config = await client.slotConfiguration.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!config) {
      return false;
    }

    // Check day of week
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    if (!config.availableDays.includes(dayOfWeek)) {
      return false;
    }

    // Check if in time range
    if (time < config.startTime || time >= config.endTime) {
      return false;
    }

    // Check special dates
    const specialDate = await this.checkSpecialDate(
      locationId,
      appointmentTypeId,
      dateObj,
      client,
    );
    if (specialDate?.isClosed) {
      return false;
    }

    // Note: BlockedSlot model has been removed from schema
    // Blocking functionality should be handled through SpecialDate model

    // Check minimum advance booking time
    const slotDateTime = new Date(`${date}T${time}`);
    const minBookingTime = new Date(
      Date.now() + config.minAdvanceBookingHours * 60 * 60 * 1000,
    );

    if (slotDateTime < minBookingTime) {
      return false;
    }

    // Check maximum advance booking window
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000;
    const localToday = new Date(today.getTime() - timezoneOffset);
    localToday.setHours(0, 0, 0, 0);
    const maxAdvanceDate = new Date(localToday);
    maxAdvanceDate.setDate(
      maxAdvanceDate.getDate() + config.advanceBookingDays,
    );
    maxAdvanceDate.setHours(23, 59, 59, 999);

    if (slotDateTime > maxAdvanceDate) {
      return false;
    }

    // Count bookings
    const bookingCount = await client.booking.count({
      where: {
        locationId,
        appointmentTypeId,
        appointmentDate: dateObj,
        appointmentTime: time,
        status: "CONFIRMED",
      },
    });

    return bookingCount < config.slotsPerInterval;
  }

  // Book an appointment slot
  async bookAppointmentSlot(
    appointmentTypeId: string,
    locationId: string,
    date: string,
    time: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    notes?: string,
  ) {
    // Start transaction
    const booking = await prisma.$transaction(
      async (tx) => {
        // Check if user already has an active booking using email or phone number
        const existingBooking = await tx.booking.findFirst({
          where: {
            OR: [{email}, {phoneNumber}],
            status: "CONFIRMED",
          },
        });

        if (existingBooking) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // If the confirmed booking is today or in the future, prevent new booking
          if (existingBooking.appointmentDate >= today) {
            throw new BadRequestError(
              "You already have an active booking with this email or phone number",
            );
          }

          // If the confirmed booking is in the past, mark it as COMPLETED
          // This ensures the "Only 1 CONFIRMED booking" rule is strictly followed
          await tx.booking.update({
            where: {id: existingBooking.id},
            data: {status: "COMPLETED"},
          });
        }

        // Check availability (use transaction client to avoid acquiring extra connections)
        const isAvailable = await this.isSlotAvailable(
          locationId,
          appointmentTypeId,
          date,
          time,
          tx,
        );

        if (!isAvailable) {
          throw new BadRequestError("This time slot is no longer available");
        }

        // Create booking
        const booking = await tx.booking.create({
          data: {
            appointmentTypeId,
            locationId,
            appointmentDate: new Date(date),
            appointmentTime: time,
            firstName,
            lastName,
            email,
            phoneNumber,
            notes,
            status: "PENDING",
          },
          include: {
            appointmentType: true,
            location: true,
          },
        });

        return booking;
      },
      {
        timeout: 15000, // 15 seconds
        maxWait: 10000,
      },
    );

    // Add email job to queue
    await addEmailJob("booking-pending-confirmation", {booking});

    return booking;
  }

  // Get booking by ID
  async getBookingById(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: {id: bookingId},
      select: {
        appointmentDate: true,
        appointmentTime: true,
        status: true,
        appointmentType: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!booking) {
      throw new BadRequestError("Booking not found");
    }

    return booking;
  }

  // confirm Booking
  async confirmBooking(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: {id: bookingId},
      include: {
        appointmentType: true,
        location: true,
      },
    });

    if (!booking) {
      throw new BadRequestError("Booking not found");
    }

    if (booking.status === "CANCELLED") {
      throw new BadRequestError("This booking is already cancelled");
    }

    if (booking.status !== "PENDING") {
      throw new BadRequestError("Only pending bookings can be confirmed");
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: {id: bookingId},
      data: {
        status: "CONFIRMED",
      },
    });

    // Add email job to queue
    await addEmailJob("booking-confirmation", {booking});

    return updatedBooking;
  }

  // Cancel a booking
  async cancelBooking(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: {id: bookingId},
      include: {
        appointmentType: true,
        location: true,
      },
    });

    if (!booking) {
      throw new BadRequestError("Booking not found");
    }

    if (booking.status === "CANCELLED") {
      throw new BadRequestError("This booking is already cancelled");
    }

    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      throw new BadRequestError(
        "Only pending or confirmed bookings can be cancelled",
      );
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: {id: bookingId},
      data: {
        status: "CANCELLED",
        cancellationDate: new Date(),
        cancelledBy: "USER",
        cancellationReason: "User cancelled the booking",
      },
      include: {
        appointmentType: true,
        location: true,
      },
    });

    // Add email job to queue
    await addEmailJob("cancellation-confirmation", {booking: updatedBooking});

    // Notify waitlist
    await this.processWaitlistForSlot(
      booking.locationId,
      booking.appointmentTypeId,
      booking.appointmentDate,
      booking.appointmentTime,
    );

    return updatedBooking;
  }

  async processWaitlistForSlot(
    locationId: string,
    appointmentTypeId: string,
    date: Date,
    time: string,
  ) {
    // Find users in waitlist for this slot
    const waitlistEntries = await prisma.waitlist.findMany({
      where: {
        locationId,
        appointmentTypeId,
        status: "WAITING",
        OR: [
          {
            AND: [
              {preferredDateStart: {lte: date}},
              {preferredDateEnd: {gte: date}},
            ],
          },
          {
            preferredDateStart: null,
            preferredDateEnd: null,
          },
        ],
      },
      orderBy: {
        joinedAt: "asc",
      },
      include: {
        appointmentType: true,
        location: true,
      },
      take: 1,
    });

    if (waitlistEntries.length > 0) {
      const waitlistEntry = waitlistEntries[0];

      // Update waitlist status
      await prisma.waitlist.update({
        where: {id: waitlistEntry.id},
        data: {
          status: "NOTIFIED",
          notifiedAt: new Date(),
          notificationCount: waitlistEntry.notificationCount + 1,
        },
      });

      // Add email job to queue
      await addEmailJob("waitlist-notification", {waitlistEntry, date, time});
    }
  }
}

export default new BookingService();
