import {Response, NextFunction} from "express";
import {AuthRequest} from "../middleware/auth";
import bookingService from "../services/booking.service";

class BookingsController {
  async createBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        appointmentTypeId,
        locationId,
        appointmentDate,
        appointmentTime,
        firstName,
        lastName,
        email,
        phoneNumber,
        notes,
      } = req.body;

      const booking = await bookingService.bookAppointmentSlot(
        appointmentTypeId,
        locationId,
        appointmentDate,
        appointmentTime,
        firstName,
        lastName,
        email,
        phoneNumber,
        notes,
      );

      res.status(201).json({
        success: true,
        data: booking,
        message: "Booking created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {id} = req.params;

      const booking = await bookingService.getBookingById(id as string);

      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {bookingId} = req.query;

      const booking = await bookingService.confirmBooking(bookingId as string);

      res.status(200).json({
        success: true,
        data: booking,
        message: "Booking confirmed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {bookingId} = req.query;

      const booking = await bookingService.cancelBooking(bookingId as string);

      res.status(200).json({
        success: true,
        data: booking,
        message: "Booking cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BookingsController();
