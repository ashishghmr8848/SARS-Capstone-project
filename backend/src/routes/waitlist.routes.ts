import {Router} from "express";
import waitlistController from "../controllers/waitlist.controller";
import {validate} from "../middleware/validation";
import {joinWaitlistSchema} from "../utils/validators";
import {authenticate} from "../middleware/auth";
import {requireAdmin} from "../middleware/roleCheck";

const router = Router();

// Public route
router.post("/", validate(joinWaitlistSchema), waitlistController.joinWaitlist);

// admin routes
router.get(
  "/",
  authenticate,
  requireAdmin,
  waitlistController.getAllWaitlistEntries,
);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  waitlistController.removeFromWaitlist,
);

export default router;
