import * as bcrypt from "bcrypt";
import prisma, {pool} from "../src/config/database";

async function main() {
  console.log("Starting seeding...");

  // 1. Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: {email: "admin@example.com"},
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "admin",
      role: "ADMIN",
    },
  });
  console.log("Admin user created/updated:", admin.email);

  // 2. Create appointment types
  const appointmentTypes = [
    {
      typeName: "Driver's License Renewal",
      description: "Renew your existing driver's license at any center.",
    },
    {
      typeName: "First Time License",
      description:
        "Apply for your first driver's license. Requires documentation.",
    },
    {
      typeName: "Vehicle Registration",
      description: "Register a new vehicle or transfer ownership.",
    },
    {
      typeName: "Written Knowledge Test",
      description: "Take the mandatory written test for learners permit.",
    },
  ];

  for (const type of appointmentTypes) {
    await prisma.appointmentType.upsert({
      where: {typeName: type.typeName},
      update: {},
      create: type,
    });
  }
  console.log("Appointment types created/updated");

  // 3. Create locations
  const locations = [
    {
      locationName: "Downtown Services Center",
      address: "123 Civic Plaza",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
      phoneNumber: "555-0101",
      email: "downtown@dmv-example.gov",
    },
    {
      locationName: "West Side Branch",
      address: "456 Commerce Blvd",
      city: "Springfield",
      state: "IL",
      zipCode: "62704",
      phoneNumber: "555-0102",
      email: "westside@dmv-example.gov",
    },
    {
      locationName: "Airport Road Service Point",
      address: "789 Skyway Dr",
      city: "Springfield",
      state: "IL",
      zipCode: "62707",
      phoneNumber: "555-0103",
      email: "airport@dmv-example.gov",
    },
  ];

  for (const location of locations) {
    await prisma.location.upsert({
      where: {locationName: location.locationName},
      update: {},
      create: location,
    });
  }
  console.log("Locations created/updated");

  // 4. Create Global Slot Configuration
  // Delete existing configurations to ensure we only have one if that's the business rule
  // but since it's identifying by ID and we want it to be global, we just upsert a known ID or findFirst
  const existingConfig = await prisma.slotConfiguration.findFirst();
  if (!existingConfig) {
    await prisma.slotConfiguration.create({
      data: {
        availableDays: [1, 2, 3, 4, 5], // Monday - Friday
        startTime: "10:00:00",
        endTime: "17:00:00",
        slotDurationMinutes: 30,
        slotsPerInterval: 1,
        bufferTimeMinutes: 0,
        advanceBookingDays: 90,
        sameDayBookingCutoffHours: 0,
        minAdvanceBookingHours: 0,
      },
    });
    console.log("Global slot configuration created");
  } else {
    console.log("Global slot configuration already exists");
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  });
