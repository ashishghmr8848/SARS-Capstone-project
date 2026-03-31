import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/database";
import {generateToken} from "../config/jwt";

const SALT_ROUNDS = 10;

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  driverLicenseNumber?: string;
}

class AuthService {
  // async register(userData: RegisterData) {
  //   const {
  //     email,
  //     password,
  //     name,
  //     phoneNumber,
  //     dateOfBirth,
  //     driverLicenseNumber,
  //   } = userData;

  //   // Check if user exists
  //   const existingUser = await prisma.user.findUnique({
  //     where: {email},
  //   });

  //   if (existingUser) {
  //   }

  //   // Hash password
  //   const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  //   // Create user
  //   const user = await prisma.user.create({
  //     data: {
  //       email,
  //       password: hashedPassword,
  //       name,
  //       phoneNumber,
  //       role: "ADMIN",
  //     },
  //     select: {
  //       id: true,
  //       email: true,
  //       name: true,
  //       role: true,
  //     },
  //   });

  //   // Generate token
  //   const token = generateToken(user.id, user.email, user.role);

  //   return {
  //     user,
  //     token,
  //   };
  // }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: {email},
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is inactive");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({
      where: {id: userId},
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: {id: userId},
      data: {password: hashedPassword},
    });

    return {message: "Password changed successfully"};
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: {email},
    });

    if (!user) {
      // Don't reveal if email exists
      return {message: "If the email exists, a reset link has been sent"};
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = await bcrypt.hash(resetToken, SALT_ROUNDS);

    // Save hashed token and expiry
    await prisma.user.update({
      where: {id: user.id},
      data: {
        resetPasswordToken: hashedResetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    // TODO: Send email with reset link containing resetToken
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    return {message: "If the email exists, a reset link has been sent"};
  }

  async resetPassword(resetToken: string, newPassword: string) {
    // Find user with valid reset token
    const users = await prisma.user.findMany({
      where: {
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    let user = null;
    for (const u of users) {
      if (u.resetPasswordToken) {
        const isValid = await bcrypt.compare(resetToken, u.resetPasswordToken);
        if (isValid) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and clear reset token
    await prisma.user.update({
      where: {id: user.id},
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return {message: "Password reset successfully"};
  }

  async updateProfile(userId: string, data: Partial<RegisterData>) {
    const user = await prisma.user.update({
      where: {id: userId},
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
      },
    });

    return user;
  }
}

export default new AuthService();
