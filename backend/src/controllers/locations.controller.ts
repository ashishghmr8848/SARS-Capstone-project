import {Response, NextFunction} from "express";
import {AuthRequest} from "../middleware/auth";
import prisma from "../config/database";

class LocationsController {
  async getAllLocations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {locationName, zipCode} = req.query;

      const where: any = {isActive: true};

      if (locationName) {
        where.locationName = {
          contains: locationName as string,
          mode: "insensitive",
        };
      }

      if (zipCode) {
        where.zipCode = {
          contains: zipCode as string,
          mode: "insensitive",
        };
      }

      const locations = await prisma.location.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({
        success: true,
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLocationById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {id} = req.params;

      const location = await prisma.location.findUnique({
        where: {id: id as string},
      });

      if (!location) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Location not found",
          },
        });
      }

      res.json({
        success: true,
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }

  async createLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {locationName, address, city, state, zipCode} = req.body;
      if(!locationName || !address || !city || !state || !zipCode) {
        return res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "All fields are required",
          },
        });
      }

      const existingLocation = await prisma.location.findUnique({
        where: {locationName},
      });

      if (existingLocation) {
        return res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Location with this name already exists",
          },
        });
      }

      const location = await prisma.location.create({
        data: req.body,
      });

      res.status(201).json({
        success: true,
        data: location,
        message: "Location created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {id} = req.params;
      const {locationName, address, city, state, zipCode} = req.body;
      if(!locationName || !address || !city || !state || !zipCode) {
        return res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "All fields are required",
          },
        });
      }

      const existingLocation = await prisma.location.findUnique({
        where: {id: id as string},
      });

      if (!existingLocation) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Location not found",
          },
        });
      }

      if (locationName) {
        const existingLocationName = await prisma.location.findUnique({
          where: {locationName: locationName as string},
        });
        if (existingLocationName && existingLocationName.id !== id) {
          return res.status(400).json({
            success: false,
            error: {
              code: "BAD_REQUEST",
              message: "Location with this name already exists",
            },
          });
        }
      }

      const location = await prisma.location.update({
        where: {id: id as string},
        data: {
          locationName,
          address,
          city,
          state,
          zipCode,
        },
      });

      res.json({
        success: true,
        data: location,
        message: "Location updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {id} = req.params;

      await prisma.location.update({
        where: {id: id as string},
        data: {isActive: false},
      });

      res.json({
        success: true,
        message: "Location deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LocationsController();
