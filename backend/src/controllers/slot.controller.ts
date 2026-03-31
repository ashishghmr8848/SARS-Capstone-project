import {Request, Response, NextFunction} from "express";
import SlotService from "../services/slot.service";
import {AuthRequest} from "../middleware/auth";
import prisma from "../config/database";

class SlotController {
  async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const locationId = req.query.locationId as string;
      const appointmentTypeId = req.query.appointmentTypeId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!locationId || !appointmentTypeId || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          message:
            "Missing required query parameters: locationId, appointmentTypeId, startDate, endDate",
        });
        return;
      }

      const slots = await SlotService.getAvailableSlots(
        locationId,
        appointmentTypeId,
        startDate,
        endDate,
      );

      res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (error) {
      next(error);
    }
  }

  // Slot configurations
  async createSlotConfiguration(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const config = await prisma.slotConfiguration.create({
        data: req.body,
      });

      res.status(201).json({
        success: true,
        data: config,
        message: "Slot configuration created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSlotConfigurations(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const configs = await prisma.slotConfiguration.findMany({
        include: {
          specialDates: true,
        },
      });

      res.json({
        success: true,
        data: configs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSlotConfiguration(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {id} = req.params;

      const config = await prisma.slotConfiguration.findUnique({
        where: {
          id: id as string,
        },
        include: {
          specialDates: true,
        },
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Slot configuration not found",
          },
        });
      }

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSlotConfiguration(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {id} = req.params;

      const config = await prisma.slotConfiguration.update({
        where: {id: id as string},
        data: req.body,
      });

      res.json({
        success: true,
        data: config,
        message: "Slot configuration updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSlotConfiguration(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {id} = req.params;

      await prisma.slotConfiguration.delete({
        where: {id: id as string},
      });

      res.json({
        success: true,
        message: "Slot configuration deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SlotController();