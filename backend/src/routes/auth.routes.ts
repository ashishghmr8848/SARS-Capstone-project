import {Router} from "express";
import authController from "../controllers/auth.controller";
import {authenticate} from "../middleware/auth";
import {validate} from "../middleware/validation";
import {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/validators";
import {requireAdmin} from "../middleware/roleCheck";

const router = Router();

// Public routes
// router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// Protected routes
router.get("/me", authenticate, requireAdmin, authController.getMe);
router.put(
  "/profile",
  authenticate,
  requireAdmin,
  authController.updateProfile,
);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

export default router;
