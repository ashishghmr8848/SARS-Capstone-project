import {Response, NextFunction} from "express";
import {AuthRequest} from "../middleware/auth";
import authService from "../services/auth.service";

class AuthController {
  // async signup(req: AuthRequest, res: Response, next: NextFunction) {
  //   try {
  //     const result = await authService.register(req.body);
  //     res.status(201).json({
  //       success: true,
  //       data: result,
  //       message: "User registered successfully",
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {email, password} = req.body;
      const result = await authService.login(email, password);
      res.json({
        success: true,
        data: result,
        message: "Login successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await authService.updateProfile(userId, req.body);
      res.json({
        success: true,
        data: result,
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {oldPassword, newPassword} = req.body;
      const result = await authService.changePassword(
        userId,
        oldPassword,
        newPassword,
      );
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {email} = req.body;
      const result = await authService.forgotPassword(email);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {resetToken, newPassword} = req.body;
      const result = await authService.resetPassword(resetToken, newPassword);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
