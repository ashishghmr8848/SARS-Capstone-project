import {Request, Response, NextFunction} from "express";
import {ZodSchema} from "zod";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const errorMessages = error.errors
        ?.map((err: any) => err.message)
        .join(", ");
      throw new Error(errorMessages || "Validation failed");
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: any) {
      const errorMessages = error.errors
        ?.map((err: any) => err.message)
        .join(", ");
      throw new Error(errorMessages || "Validation failed");
    }
  };
};
