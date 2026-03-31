import {Response, NextFunction} from "express";
import {AuthRequest} from "../middleware/auth";
import prisma from "../config/database";

class AppointmentsController {
  async getAllAppointmentTypes(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {search} = req.query;

      const where: any = {isActive: true};

      if (search) {
        where.typeName = {
          contains: search as string,
          mode: "insensitive",
        };
      }

      const appointmentTypes = await prisma.appointmentType.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({
        success: true,
        data: appointmentTypes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentTypeById(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {id} = req.params;

      const appointmentType = await prisma.appointmentType.findUnique({
        where: {id: id as string},
      });

      if (!appointmentType) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Appointment type not found",
          },
        });
      }

      res.json({
        success: true,
        data: appointmentType,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAppointmentType(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {typeName, description} = req.body;
      if (!typeName || !description) {
        return res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required fields",
          },
        });
      }

      const existingType = await prisma.appointmentType.findUnique({
        where: {typeName: typeName as string},
      });

      if (existingType) {
        return res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Appointment type already exists",
          },
        });
      }

      const appointmentType = await prisma.appointmentType.create({
        data: {typeName, description},
      });

      res.status(201).json({
        success: true,
        data: appointmentType,
        message: "Appointment type created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAppointmentType(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {id} = req.params;
      const {typeName, description} = req.body;

      const existingType = await prisma.appointmentType.findUnique({
        where: {id: id as string},
      });

      if (!existingType) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Appointment type not found",
          },
        });
      }

      const existingTypeName = await prisma.appointmentType.findUnique({
        where: {typeName: typeName as string},
      });
      if(existingTypeName && existingTypeName.id !== id){
        return res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Appointment type with this name already exists",
          },
        });
      }
      
      const appointmentType = await prisma.appointmentType.update({
        where: {id: id as string},
        data: {typeName, description},
      });

      res.json({
        success: true,
        data: appointmentType,
        message: "Appointment type updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAppointmentType(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {id} = req.params;

      await prisma.appointmentType.update({
        where: {id: id as string},
        data: {isActive: false},
      });

      res.json({
        success: true,
        message: "Appointment type deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AppointmentsController();
