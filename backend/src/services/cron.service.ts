import cron from "node-cron";
import prisma from "../config/database";
import {addEmailJob} from "../queues/emailQueue";

class CronService {
  /**
   * Send appointment reminders at 12:00 AM every day
   * Cron expression: '0 0 * * *'
   * - Minute: 0
   * - Hour: 0 (12:00 AM)
   * - Day of Month: * (every day)
   * - Month: * (every month)
   * - Day of Week: * (every day of week)
   */
  startDailyReminderJob() {
    cron.schedule(
      "0 0 * * *",
      async () => {
        console.log(
          "🔔 Running daily appointment reminder job at:",
          new Date().toISOString(),
        );

        try {
          await this.sendDailyReminders();
          console.log("✅ Daily reminder job completed successfully");
        } catch (error) {
          console.error("❌ Error in daily reminder job:", error);
        }
      },
      {
        timezone: "America/New_York", // Change this to your timezone
      },
    );

    console.log("📅 Daily appointment reminder cron job scheduled (12:00 AM)");
  }

  /**
   * Send reminders to all users who have confirmed appointments today
   */
  async sendDailyReminders() {
    try {
      // Get today's date (start and end of day) in UTC to match database
      const now = new Date();
      const today = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      );

      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      // Find all confirmed bookings for today
      const todaysBookings = await prisma.booking.findMany({
        where: {
          appointmentDate: {
            gte: today,
            lt: tomorrow,
          },
          status: "CONFIRMED",
        },
        include: {
          appointmentType: true,
          location: true,
        },
      });

      console.log(`📧 Found ${todaysBookings.length} appointments for today`);

      // Send reminder emails for each booking
      for (const booking of todaysBookings) {
        try {
          // Use email queue for better reliability
          await addEmailJob("appointment-reminder", {
            booking,
          });

          console.log(
            `✉️  Queued reminder for ${booking.email} (Ref: ${booking.bookingReference})`,
          );
        } catch (error) {
          console.error(
            `Failed to queue reminder for booking ${booking.bookingReference}:`,
            error,
          );
        }
      }

      return {
        success: true,
        count: todaysBookings.length,
        message: `Queued ${todaysBookings.length} appointment reminders`,
      };
    } catch (error) {
      console.error("Error sending daily reminders:", error);
      throw error;
    }
  }
}

export default new CronService();
