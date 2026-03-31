import {Router} from "express";
import bookingsController from "../controllers/bookings.controller";
import {validate, validateQuery} from "../middleware/validation";
import {
  cancelBookingSchema,
  confirmBookingSchema,
  createBookingSchema,
} from "../utils/validators";

const router = Router();

router.post(
  "/",
  validate(createBookingSchema),
  bookingsController.createBooking,
);

router.get(
  "/confirm",
  validateQuery(confirmBookingSchema),
  bookingsController.confirmBooking,
);

router.get(
  "/cancel",
  validateQuery(cancelBookingSchema),
  bookingsController.cancelBooking,
);

router.get("/:id", bookingsController.getBookingById);



export default router;
