import {Router} from "express";
import slotController from "../controllers/slot.controller";
import {validate} from "../middleware/validation";
import {
  createSlotConfigurationSchema,
  updateSlotConfigurationSchema,
} from "../utils/validators";
import adminController from "../controllers/admin.controller";

const router = Router();

// Public/User routes
router.get("/available", slotController.getAvailableSlots);

// get special dates
router.get("/special-dates", adminController.getAllSpecialDates);

// Admin routes
router.post(
  "/slot-configurations",
  validate(createSlotConfigurationSchema),
  slotController.createSlotConfiguration,
);
router.get("/configurations", slotController.getAllSlotConfigurations);
router.get("/configurations/:id", slotController.getSlotConfiguration);
router.put(
  "/configurations/:id",
  validate(updateSlotConfigurationSchema),
  slotController.updateSlotConfiguration,
);
router.delete("/configurations/:id", slotController.deleteSlotConfiguration);


export default router;
