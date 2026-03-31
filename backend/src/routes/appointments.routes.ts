import {Router} from "express";
import appointmentsController from "../controllers/appointments.controller";
import {authenticate} from "../middleware/auth";
import {requireAdmin} from "../middleware/roleCheck";
import {validate} from "../middleware/validation";
import {
  createAppointmentTypeSchema,
  updateAppointmentTypeSchema,
} from "../utils/validators";

const router = Router();

// Public routes
router.get("/", appointmentsController.getAllAppointmentTypes);
router.get("/:id", appointmentsController.getAppointmentTypeById);

// Admin routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createAppointmentTypeSchema),
  appointmentsController.createAppointmentType,
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate(updateAppointmentTypeSchema),
  appointmentsController.updateAppointmentType,
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  appointmentsController.deleteAppointmentType,
);

export default router;
