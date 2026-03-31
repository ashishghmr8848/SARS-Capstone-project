import {Request, Response, NextFunction} from "express";
import {AuthRequest} from "../middleware/auth";
import waitlistService from "../services/waitlist.service";

class WaitlistController {
  async joinWaitlist(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        appointmentTypeId,
        locationId,
        firstName,
        lastName,
        email,
        phoneNumber,
        preferredDateStart,
        preferredDateEnd,
        notes,
      } = req.body;

      const waitlistEntry = await waitlistService.joinWaitlist(
        appointmentTypeId,
        locationId,
        firstName,
        lastName,
        email,
        phoneNumber,
        preferredDateStart,
        preferredDateEnd,
        notes,
      );

      res.status(201).json({
        success: true,
        data: waitlistEntry,
        message: "Added to waitlist successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWaitlistEntry(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {id} = req.params;
      const userId = req.user!.id;

      const entry = await waitlistService.updateWaitlistEntry(
        id as string,
        userId,
        req.body,
      );

      res.json({
        success: true,
        data: entry,
        message: "Waitlist entry updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all waitlist entries
  async getAllWaitlistEntries(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {locationId, appointmentTypeId, status} = req.query;

      const entries = await waitlistService.getAllWaitlistEntries({
        locationId: locationId as string,
        appointmentTypeId: appointmentTypeId as string,
        status: status as string,
      });

      res.json({
        success: true,
        data: entries,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromWaitlist(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {id} = req.params;
      const userId = req.user!.id;

      const entry = await waitlistService.removeFromWaitlist(
        id as string,
        userId,
      );

      res.json({
        success: true,
        data: entry,
        message: "Removed from waitlist successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new WaitlistController();
