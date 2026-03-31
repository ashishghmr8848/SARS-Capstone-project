import {Response, NextFunction} from "express";
import {AuthRequest} from "../middleware/auth";
import prisma from "../config/database";
import bookingService from "../services/booking.service";

class AdminController {
  // Get all bookings with filters
  async getAllBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        page = "1",
        limit = "20",
        status,
        locationId,
        startDate,
        endDate,
      } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {};
      if (status) where.status = status;
      if (locationId) where.locationId = locationId;
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: parseInt(limit as string),
          include: {
            appointmentType: true,
            location: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.booking.count({where}),
      ]);

      res.json({
        success: true,
        data: bookings,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get booking statistics
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [totalBookings, activeWaitlist, totalLocations] = await Promise.all(
        [
          prisma.booking.count(),
          prisma.waitlist.count({where: {status: "WAITING"}}),
          prisma.location.count(),
        ],
      );

      res.json({
        success: true,
        data: {
          totalBookings,
          activeWaitlist,
          totalLocations,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update booking status
  async updateBookingStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {id} = req.params;
      const {status} = req.body;

      const booking = await prisma.booking.update({
        where: {id: id as string},
        data: {status},
        include: {
          appointmentType: true,
          location: true,
        },
      });

      res.json({
        success: true,
        data: booking,
        message: "Booking status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Cancel booking (admin)
  async cancelBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {id} = req.params;
      const {reason} = req.body;

      const booking = await prisma.booking.findUnique({
        where: {
          id: id as string,
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "CANCELLED") {
        throw new Error("Booking is already cancelled");
      }

      const updatedBooking = await prisma.booking.update({
        where: {id: id as string},
        data: {
          status: "CANCELLED",
          cancellationDate: new Date(),
          cancelledBy: "ADMIN",
          cancellationReason: reason,
        },
        include: {
          appointmentType: true,
          location: true,
        },
      });

      await bookingService.processWaitlistForSlot(
        updatedBooking.locationId,
        updatedBooking.appointmentTypeId,
        updatedBooking.appointmentDate,
        updatedBooking.appointmentTime,
      );

      res.json({
        success: true,
        data: updatedBooking,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {page = "1", limit = "20"} = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: parseInt(limit as string),
          select: {
            id: true,
            email: true,
            name: true,
            phoneNumber: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.user.count(),
      ]);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user role
  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {id} = req.params;
      const {role} = req.body;

      const user = await prisma.user.update({
        where: {id: id as string},
        data: {role},
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      res.json({
        success: true,
        data: user,
        message: "User role updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Create special date
  async createSpecialDate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const specialDate = await prisma.specialDate.create({
        data: {
          ...req.body,
          date: new Date(req.body.date),
        },
      });

      res.status(201).json({
        success: true,
        data: specialDate,
        message: "Special date created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all special dates
  async getAllSpecialDates(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const specialDates = await prisma.specialDate.findMany({
        orderBy: {
          date: "asc",
        },
      });

      res.json({
        success: true,
        data: specialDates,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete special date
  async deleteSpecialDate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {id} = req.params;

      await prisma.specialDate.delete({
        where: {id: id as string},
      });

      res.json({
        success: true,
        message: "Special date deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
