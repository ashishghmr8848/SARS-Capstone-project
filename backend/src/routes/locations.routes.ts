import {Router} from "express";
import locationsController from "../controllers/locations.controller";
import {authenticate} from "../middleware/auth";
import {requireAdmin} from "../middleware/roleCheck";
import {validate} from "../middleware/validation";
import {createLocationSchema, updateLocationSchema} from "../utils/validators";

const router = Router();

// Public routes
router.get("/", locationsController.getAllLocations);
router.get("/:id", locationsController.getLocationById);

// Admin routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createLocationSchema),
  locationsController.createLocation,
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate(updateLocationSchema),
  locationsController.updateLocation,
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  locationsController.deleteLocation,
);

export default router;
