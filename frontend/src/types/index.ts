export type UserRole = "ADMIN" | "USER" | "STAFF";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  dateOfBirth?: string;
  driverLicenseNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentType {
  id: string;
  typeName: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber?: string;
  email?: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  appointmentTypeId: string;
  locationId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM:SS
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  bookingReference: string;
  notes?: string;
  createdAt: string;
  appointmentType?: AppointmentType;
  location?: Location;
}

export interface WaitlistEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  appointmentTypeId: string;
  locationId: string;
  preferredDateStart?: string;
  preferredDateEnd?: string;
  notes?: string;
  status: "WAITING" | "NOTIFIED" | "EXPIRED" | "CONVERTED";
  position?: number;
  joinedAt: string;
  appointmentType?: AppointmentType;
  location?: Location;
}

export interface SlotConfiguration {
  id?: string;
  availableDays: number[]; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  slotDurationMinutes: number;
  slotsPerInterval: number;
  bufferTimeMinutes: number;
  advanceBookingDays: number;
  sameDayBookingCutoffHours: number;
  minAdvanceBookingHours: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  availableCapacity: number;
  totalCapacity: number;
}

export interface BlockedSlot {
  id: string;
  locationId?: string;
  appointmentTypeId?: string;
  startTime: string; // ISO or DateTime
  endTime: string; // ISO or DateTime
  reason?: string;
}

export interface SpecialDate {
  id: string;
  locationId?: string; // null for all locations
  date: string;
  description?: string;
  isClosed: boolean;
  startTime?: string;
  endTime?: string;
}
