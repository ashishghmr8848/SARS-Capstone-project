import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import EmailService from '../services/email.service';

const emailWorker = new Worker(
  'email-queue',
  async (job: Job) => {
    console.log(`Processing email job ${job.id}: ${job.name}`);
    try {
      switch (job.name) {
        case 'booking-pending-confirmation':
          await EmailService.sendBookingPendingConfirmation(job.data.booking);
          break;
        case 'booking-confirmation':
          await EmailService.sendBookingConfirmation(job.data.booking);
          break;
        case 'cancellation-confirmation':
          await EmailService.sendCancellationConfirmation(job.data.booking);
          break;
        case 'waitlist-joined':
          await EmailService.sendWaitlistJoinedConfirmation(job.data.waitlistEntry);
          break;
        case 'waitlist-notification':
          await EmailService.sendWaitlistNotification(
            job.data.waitlistEntry,
            job.data.date,
            job.data.time
          ); // check parameter alignment
          break;
        case 'appointment-reminder':
          await EmailService.sendAppointmentReminder(job.data.booking);
          break;
        case 'password-reset':
          await EmailService.sendPasswordResetEmail(
            job.data.email,
            job.data.resetToken
          );
          break;
        case 'general-email':
            await EmailService.sendEmail(
                job.data.to,
                job.data.subject,
                job.data.html
            )
            break;
        default:
          console.warn(`Unknown email job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`Failed to process email job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redisConfig,
    concurrency: 5, // Adjust based on needs
  }
);

emailWorker.on("ready", () => {
  console.log("Email worker is ready");
})

emailWorker.on('completed', (job: Job) => {
  console.log(`Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`Email job ${job?.id} failed with error: ${err.message}`);
});

export default emailWorker;
