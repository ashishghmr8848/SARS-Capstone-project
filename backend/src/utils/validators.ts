import {z} from "zod";

// Auth validation schemas
export const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  driverLicenseNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// Booking validation schemas
export const createBookingSchema = z.object({
  appointmentTypeId: z.uuid("Invalid appointment type ID"),
  locationId: z.uuid("Invalid location ID"),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format (HH:MM:SS)"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  notes: z.string().optional(),
});

export const confirmBookingSchema = z.object({
  bookingId: z.uuid("Invalid booking ID"),
});

export const cancelBookingSchema = z.object({
  bookingId: z.uuid("Invalid booking ID"),
});

// Waitlist validation schemas
// Waitlist validation schemas
export const joinWaitlistSchema = z.object({
  appointmentTypeId: z.string().uuid("Invalid appointment type ID"),
  locationId: z.string().uuid("Invalid location ID"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  preferredDateStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(),
  preferredDateEnd: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(),
  notes: z.string().optional(),
});

// Appointment Type validation schemas
export const createAppointmentTypeSchema = z.object({
  typeName: z.string().min(1, "Type name is required"),
  description: z.string().optional(),
});

export const updateAppointmentTypeSchema = z.object({
  typeName: z.string().min(1, "Type name is required").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Location validation schemas
export const createLocationSchema = z.object({
  locationName: z.string().min(1, "Location name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  phoneNumber: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
});

export const updateLocationSchema = z.object({
  locationName: z.string().min(1, "Location name is required").optional(),
  address: z.string().min(1, "Address is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  zipCode: z.string().min(1, "Zip code is required").optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  isActive: z.boolean().optional(),
});

// Slot Configuration validation schemas (Global configuration)
export const createSlotConfigurationSchema = z.object({
  availableDays: z.array(z.number().int().min(0).max(6)),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format (HH:MM:SS)"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format (HH:MM:SS)"),
  slotDurationMinutes: z.number().int().positive(),
  slotsPerInterval: z.number().int().positive(),
  bufferTimeMinutes: z.number().int().min(0),
  advanceBookingDays: z.number().int().positive(),
  sameDayBookingCutoffHours: z.number().int().min(0),
  minAdvanceBookingHours: z.number().int().min(0),
});

export const updateSlotConfigurationSchema =
  createSlotConfigurationSchema.partial();

// Special Date validation schemas
export const createSpecialDateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  dateType: z.enum(["HOLIDAY", "CLOSURE", "MODIFIED_HOURS"]),
  reason: z.string().optional(),
  isClosed: z.boolean().optional(),
  modifiedStartTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format")
    .optional(),
  modifiedEndTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format")
    .optional(),
  appliesToAllLocations: z.boolean().optional(),
  appliesToAllAppointmentTypes: z.boolean().optional(),
});