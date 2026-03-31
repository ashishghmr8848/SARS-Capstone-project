import {Router} from "express";
import adminController from "../controllers/admin.controller";
import {authenticate} from "../middleware/auth";
import {requireAdmin} from "../middleware/roleCheck";
import {validate} from "../middleware/validation";
import {createSpecialDateSchema} from "../utils/validators";

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Bookings management
router.get("/bookings", adminController.getAllBookings);
router.get("/statistics", adminController.getStatistics);
router.put("/bookings/:id/status", adminController.updateBookingStatus);
router.put("/bookings/:id/cancel", adminController.cancelBooking);

// User management
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/role", adminController.updateUserRole);

// Special dates
router.post(
  "/special-dates",
  validate(createSpecialDateSchema),
  adminController.createSpecialDate,
);
router.get("/special-dates", adminController.getAllSpecialDates);
router.delete("/special-dates/:id", adminController.deleteSpecialDate);

export default router;
