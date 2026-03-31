import dotenv from "dotenv";
import cronService from "../services/cron.service";
import prisma from "../config/database";

// Load environment variables
dotenv.config();

/**
 * Test script for the cron service
 * This script manually triggers the daily reminder job to test its functionality
 *
 * Usage: ts-node src/tests/testCronService.ts
 */

async function testDailyReminders() {
  console.log("=".repeat(60));
  console.log("🧪 Testing Cron Service - Daily Reminders");
  console.log("=".repeat(60));
  console.log(`📅 Current Date/Time: ${new Date().toISOString()}\n`);

  try {
    // Get today's date using UTC to match database dates
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
    );

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    console.log("📊 Checking database for today's appointments...");
    console.log(`   Current time: ${now.toISOString()}`);
    console.log(`   Today (UTC): ${today.toISOString()}`);
    console.log(`   Tomorrow (UTC): ${tomorrow.toISOString()}\n`);

    const todaysBookings = await prisma.booking.findMany({
      where: {
        appointmentDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        appointmentType: true,
        location: true,
      },
    });

    console.log(`📋 Total bookings for today: ${todaysBookings.length}`);

    if (todaysBookings.length > 0) {
      console.log("\n📝 Booking details:");

      const confirmedCount = todaysBookings.filter(
        (b) => b.status === "CONFIRMED",
      ).length;
      console.log(
        `✅ Confirmed bookings (will receive reminder): ${confirmedCount}`,
      );
    } else {
      console.log("ℹ️  No appointments found for today.");
    }

    // Now run the actual cron service method
    console.log("=".repeat(60));
    console.log("🚀 Running cronService.sendDailyReminders()...\n");

    const result = await cronService.sendDailyReminders();

    console.log("\n" + "=".repeat(60));
    console.log("✅ Test completed successfully!");
    console.log("=".repeat(60));
    console.log("📊 Result:", result);
    console.log(
      "\n💡 Note: Check your email queue worker to see if emails are being processed.",
    );
    console.log(
      "   The emails are queued, not sent immediately by this script.\n",
    );
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ Test failed with error:");
    console.error("=".repeat(60));
    console.error(error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await prisma.$disconnect();
    console.log("🔌 Disconnected from database");
    process.exit(0);
  }
}

// Run the test
testDailyReminders();
