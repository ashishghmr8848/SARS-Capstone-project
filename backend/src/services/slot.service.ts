import prisma from "../config/database";

interface SlotInfo {
  date: string;
  time: string;
  availableCapacity: number;
  totalCapacity: number;
}

class SlotService {
  async getAvailableSlots(
    locationId: string,
    appointmentTypeId: string,
    startDate: string,
    endDate: string,
  ): Promise<SlotInfo[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get global slot configuration (there should be only one active config)
    const config = await prisma.slotConfiguration.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!config) {
      return [];
    }

    // Calculate the maximum date based on advanceBookingDays
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxAdvanceDate = new Date(today);
    maxAdvanceDate.setDate(
      maxAdvanceDate.getDate() + config.advanceBookingDays,
    );

    // Limit end date to maxAdvanceDate
    const effectiveEndDate = end > maxAdvanceDate ? maxAdvanceDate : end;

    const availableSlots: SlotInfo[] = [];
    const currentDate = new Date(start);

    // Generate slots for each day in range
    while (currentDate <= effectiveEndDate) {
      const dayOfWeek = currentDate.getDay();

      // Check if this day is available
      if (!config.availableDays.includes(dayOfWeek)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Check for special dates (holidays, closures)
      const specialDate = await this.checkSpecialDate(
        locationId,
        appointmentTypeId,
        currentDate,
      );

      if (specialDate?.isClosed) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Get time range (use modified hours if applicable)
      let startTime = config.startTime;
      let endTime = config.endTime;

      if (specialDate?.dateType === "MODIFIED_HOURS") {
        startTime = specialDate.modifiedStartTime || startTime;
        endTime = specialDate.modifiedEndTime || endTime;
      }

      // Generate time slots for this day
      const daySlots = await this.generateTimeSlotsForDay(
        locationId,
        appointmentTypeId,
        currentDate,
        startTime,
        endTime,
        config,
      );

      availableSlots.push(...daySlots);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableSlots;
  }

  async generateTimeSlotsForDay(
    locationId: string,
    appointmentTypeId: string,
    date: Date,
    startTime: string,
    endTime: string,
    config: any,
  ): Promise<SlotInfo[]> {
    const slots: SlotInfo[] = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const slotStart = new Date(date);
    slotStart.setHours(startHour, startMin, 0, 0);

    const slotEnd = new Date(date);
    slotEnd.setHours(endHour, endMin, 0, 0);

    const intervalMs =
      (config.slotDurationMinutes + config.bufferTimeMinutes) * 60 * 1000;

    let currentSlot = new Date(slotStart);

    while (currentSlot < slotEnd) {
      const slotTime = currentSlot.toTimeString().substring(0, 8);

      // Check if slot is in the future
      const now = new Date();
      const cutoffTime = new Date(
        now.getTime() + config.sameDayBookingCutoffHours * 60 * 60 * 1000,
      );

      if (currentSlot <= cutoffTime) {
        currentSlot = new Date(currentSlot.getTime() + intervalMs);
        continue;
      }

      // Count existing bookings
      const bookingCount = await prisma.booking.count({
        where: {
          locationId,
          appointmentTypeId,
          appointmentDate: date,
          appointmentTime: slotTime,
          status: "CONFIRMED",
        },
      });

      const availableCapacity = config.slotsPerInterval - bookingCount;

      // ============================================
      // FIX: Return ALL slots, not just available ones
      // Frontend needs to see fully booked slots too
      // ============================================
      slots.push({
        date: date.toISOString().split("T")[0],
        time: slotTime,
        availableCapacity: Math.max(0, availableCapacity), // Ensure non-negative
        totalCapacity: config.slotsPerInterval,
      });

      currentSlot = new Date(currentSlot.getTime() + intervalMs);
    }

    return slots;
  }

  async checkSpecialDate(
    locationId: string,
    appointmentTypeId: string,
    date: Date,
  ) {
    const specialDate = await prisma.specialDate.findFirst({
      where: {
        date: date,
        OR: [
          {appliesToAllLocations: true},
          {appliesToAllLocations: true, appliesToAllAppointmentTypes: true},
        ],
      },
    });

    return specialDate;
  }

  async isSlotAvailable(
    locationId: string,
    appointmentTypeId: string,
    date: string,
    time: string,
  ): Promise<boolean> {
    // Get global slot configuration
    const config = await prisma.slotConfiguration.findFirst({
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
    );
    if (specialDate?.isClosed) {
      return false;
    }

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
    today.setHours(0, 0, 0, 0);
    const maxAdvanceDate = new Date(today);
    maxAdvanceDate.setDate(
      maxAdvanceDate.getDate() + config.advanceBookingDays,
    );
    maxAdvanceDate.setHours(23, 59, 59, 999);

    if (slotDateTime > maxAdvanceDate) {
      return false;
    }

    // Count bookings
    const bookingCount = await prisma.booking.count({
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
}

export default new SlotService();
