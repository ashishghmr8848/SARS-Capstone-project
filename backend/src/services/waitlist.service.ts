import prisma from "../config/database";
import { BadRequestError } from "../utils/errors";
import emailService from "./email.service";

class WaitlistService {
  async joinWaitlist(
    appointmentTypeId: string,
    locationId: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    preferredDateStart: string,
    preferredDateEnd: string,
    notes?: string,
  ) {
    // Check if user already has an active booking
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingBooking = await prisma.booking.findFirst({
      where: {
        OR: [{email}, {phoneNumber}],
        status: {in: ["PENDING", "CONFIRMED"]},
        appointmentDate: {
          gte: today,
        },
      },
    });

    if (existingBooking) {
      throw new BadRequestError("You already have an active booking");
    }

    // Parse the preferred dates from parameters
    const newStartDate = new Date(preferredDateStart);

    const newEndDate = new Date(preferredDateEnd);

    // Check if user is already on waitlist for this location/appointment type with overlapping dates
    const existingWaitlist = await prisma.waitlist.findFirst({
      where: {
        appointmentTypeId,
        locationId,
        OR: [{email}, {phoneNumber}],
        status: {in: ["WAITING", "NOTIFIED"]},
        AND: [
          {
            OR: [
              {
                AND: [
                  {preferredDateStart: {lte: newEndDate}},
                  {preferredDateEnd: {gte: newStartDate}},
                ],
              },
              {
                preferredDateStart: null,
                preferredDateEnd: null,
              },
            ],
          },
        ],
      },
    });

    if (existingWaitlist) {
      throw new BadRequestError(
        "You are already on the waitlist for this appointment type and location",
      );
    }

    // Get current waitlist position
    const currentCount = await prisma.waitlist.count({
      where: {
        appointmentTypeId,
        locationId,
        status: "WAITING",
      },
    });

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        appointmentTypeId,
        locationId,
        firstName,
        lastName,
        email,
        phoneNumber,
        preferredDateStart: preferredDateStart
          ? new Date(preferredDateStart)
          : undefined,
        preferredDateEnd: preferredDateEnd
          ? new Date(preferredDateEnd)
          : undefined,
        notes,
        position: currentCount + 1,
        status: "WAITING",
      },
      include: {
        appointmentType: true,
        location: true,
      },
    });

    // send email
    await emailService.sendWaitlistJoinedConfirmation(waitlistEntry);

    return waitlistEntry;
  }

  async updateWaitlistEntry(
    waitlistId: string,
    userId: string,
    data: {
      preferredDateStart?: string;
      preferredDateEnd?: string;
      notes?: string;
    },
  ) {
    const entry = await prisma.waitlist.findUnique({
      where: {id: waitlistId},
    });

    if (!entry) {
      throw new Error("Waitlist entry not found");
    }

    if (entry.status !== "WAITING") {
      throw new Error("Can only update waiting entries");
    }

    return await prisma.waitlist.update({
      where: {id: waitlistId},
      data: {
        preferredDateStart: data.preferredDateStart
          ? new Date(data.preferredDateStart)
          : undefined,
        preferredDateEnd: data.preferredDateEnd
          ? new Date(data.preferredDateEnd)
          : undefined,
        notes: data.notes,
      },
      include: {
        appointmentType: true,
        location: true,
      },
    });
  }

  async removeFromWaitlist(waitlistId: string, userId: string) {
    const entry = await prisma.waitlist.findUnique({
      where: {id: waitlistId},
    });

    if (!entry) {
      throw new Error("Waitlist entry not found");
    }

    // Update status to cancelled instead of deleting
    return await prisma.waitlist.update({
      where: {id: waitlistId},
      data: {
        status: "CANCELLED",
      },
    });
  }

  // Admin function to get all waitlist entries
  async getAllWaitlistEntries(filters?: {
    locationId?: string;
    appointmentTypeId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }
    if (filters?.appointmentTypeId) {
      where.appointmentTypeId = filters.appointmentTypeId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    return await prisma.waitlist.findMany({
      where,
      include: {
        appointmentType: true,
        location: true,
      },
      orderBy: {
        joinedAt: "asc",
      },
    });
  }
}

export default new WaitlistService();
