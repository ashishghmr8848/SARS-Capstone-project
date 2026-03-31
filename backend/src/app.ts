import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import appointmentRoutes from "./routes/appointments.routes";
import locationRoutes from "./routes/locations.routes";
import bookingRoutes from "./routes/bookings.routes";
import waitlistRoutes from "./routes/waitlist.routes";
import adminRoutes from "./routes/admin.routes";
import slotRoutes from "./routes/slots.routes";

import errorHandler from "./middleware/errorHandler";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

// Rate limiting
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
//   message: "Too many requests from this IP, please try again later.",
// });
// app.use("/api/", limiter);

// Body parsing
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));
app.use(cookieParser());

// Compression
app.use(compression());

// Health check
app.get("/health", async (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// Global error handler
app.use(errorHandler);

export default app;
