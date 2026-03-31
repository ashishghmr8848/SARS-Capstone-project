import {emailConfig, transporter} from "../config/email";
import {generateBookingPDF} from "../utils/pdf";

class EmailService {
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    attachments?: any[],
  ) {
    try {
      await transporter.sendMail({
        from: `${emailConfig.fromName} <${emailConfig.from}>`,
        to,
        subject,
        html,
        attachments,
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  async sendBookingPendingConfirmation(booking: any) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const bookingUrl = `${frontendUrl}/booking/action?bookingId=${booking.id}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Booking Confirmation</h2>
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        <p>Thank you for your booking! Your appointment is currently <strong>pending confirmation</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #333;">Appointment Details</h3>
          <p><strong>Reference Number:</strong> ${booking.bookingReference}</p>
          <p><strong>Type:</strong> ${booking.appointmentType.typeName}</p>
          <p><strong>Date:</strong> ${new Date(booking.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.appointmentTime}</p>
          <p><strong>Location:</strong> ${booking.location.locationName}</p>
          <p><strong>Address:</strong> ${booking.location.address}, ${booking.location.city}, ${booking.location.state} ${booking.location.zipCode}</p>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <p style="margin-bottom: 15px;"><strong>Please confirm or cancel your booking:</strong></p>
          <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <a href="${bookingUrl}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 5px;">Confirm Booking</a>
            <a href="${bookingUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin: 5px;">Cancel Booking</a>
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px;">Please arrive 10 minutes before your scheduled time.</p>
        <p style="color: #666; font-size: 14px;">If you need to reschedule, please cancel this booking and create a new one.</p>
        
        <p>Thank you!</p>
      </div>
    `;

    return await this.sendEmail(
      booking.email,
      "Appointment Booking - Confirmation Required",
      html,
    );
  }

  async sendBookingConfirmation(booking: any) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const bookingUrl = `${frontendUrl}/booking/action?bookingId=${booking.id}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Appointment Confirmed</h2>
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        <p>Your appointment has been <strong>confirmed</strong> successfully.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #333;">Appointment Details</h3>
          <p><strong>Reference Number:</strong> ${booking.bookingReference}</p>
          <p><strong>Type:</strong> ${booking.appointmentType.typeName}</p>
          <p><strong>Date:</strong> ${new Date(booking.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.appointmentTime}</p>
          <p><strong>Location:</strong> ${booking.location.locationName}</p>
          <p><strong>Address:</strong> ${booking.location.address}, ${booking.location.city}, ${booking.location.state} ${booking.location.zipCode}</p>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <p style="margin-bottom: 15px;"><strong>Need to cancel?</strong></p>
          <a href="${bookingUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Cancel Booking</a>
        </div>
        
        <p style="color: #666; font-size: 14px;">Please arrive 10 minutes before your scheduled time.</p>
        
        <p>Thank you!</p>
      </div>
    `;

    const pdfBuffer = await generateBookingPDF(booking);

    return await this.sendEmail(booking.email, "Appointment Confirmed", html, [
      {
        filename: "BookingConfirmation.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ]);
  }

  async sendCancellationConfirmation(booking: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Cancelled</h2>
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        <p>Your appointment has been cancelled.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Cancelled Appointment Details</h3>
          <p><strong>Reference Number:</strong> ${booking.bookingReference}</p>
          <p><strong>Type:</strong> ${booking.appointmentType.typeName}</p>
          <p><strong>Date:</strong> ${new Date(booking.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.appointmentTime}</p>
          <p><strong>Location:</strong> ${booking.location.locationName}</p>
          <p><strong>Address:</strong> ${booking.location.address}, ${booking.location.city}, ${booking.location.state} ${booking.location.zipCode}</p>
        </div>
        
        <p>You can book a new appointment at any time through our website.</p>
        
        <p>Thank you!</p>
      </div>
    `;

    return await this.sendEmail(booking.email, "Appointment Cancelled", html);
  }

  async sendWaitlistJoinedConfirmation(waitlistEntry: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've Joined the Waitlist!</h2>
        <p>Dear ${waitlistEntry.firstName} ${waitlistEntry.lastName},</p>
        <p>You have successfully been added to the waitlist.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Waitlist Details</h3>
          <p><strong>Type:</strong> ${waitlistEntry.appointmentType.typeName}</p>
          <p><strong>Preferred Date:</strong> ${waitlistEntry.preferredDateStart ? new Date(waitlistEntry.preferredDateStart).toLocaleDateString() : "Any"}</p>
          <p><strong>Location:</strong> ${waitlistEntry.location.locationName}</p>
          <p><strong>Address:</strong> ${waitlistEntry.location.address}, ${waitlistEntry.location.city}, ${waitlistEntry.location.state} ${waitlistEntry.location.zipCode}</p>
        </div>
        
        <p>We will notify you via email if an appointment slot becomes available.</p>
        
        <p>Thank you!</p>
      </div>
    `;

    return await this.sendEmail(
      waitlistEntry.email,
      "You've Joined the Waitlist",
      html,
    );
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the button below to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    return await this.sendEmail(email, "Password Reset Request", html);
  }

  async sendWaitlistNotification(waitlistEntry: any, date: Date, time: string) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const bookingUrl = `${frontendUrl}/dashboard/book`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">hello! A Slot is Available</h2>
        <p>Dear ${waitlistEntry.firstName} ${waitlistEntry.lastName},</p>
        <p>A time slot you were waiting for has just become available!</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #333;">Available Slot Details</h3>
          <p><strong>Type:</strong> ${waitlistEntry.appointmentType.typeName}</p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Location:</strong> ${waitlistEntry.location.locationName}</p>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
          <p style="margin-bottom: 15px;"><strong>Book this slot before it's taken:</strong></p>
          <a href="${bookingUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Book Now</a>
        </div>
        
        <p style="color: #666; font-size: 14px;">This slot is available on a first-come, first-served basis.</p>
        
        <p>Thank you!</p>
      </div>
    `;

    return await this.sendEmail(
      waitlistEntry.email,
      "Slot Available - Action Required",
      html,
    );
  }

  async sendAppointmentReminder(booking: any) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const bookingUrl = `${frontendUrl}/booking/action?bookingId=${booking.id}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Appointment Reminder - Today!</h2>
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        <p>This is a friendly reminder about your appointment <strong>today</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #333;">Appointment Details</h3>
          <p><strong>Reference Number:</strong> ${booking.bookingReference}</p>
          <p><strong>Type:</strong> ${booking.appointmentType.typeName}</p>
          <p><strong>Date:</strong> ${new Date(booking.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.appointmentTime}</p>
          <p><strong>Location:</strong> ${booking.location.locationName}</p>
          <p><strong>Address:</strong> ${booking.location.address}, ${booking.location.city}, ${booking.location.state} ${booking.location.zipCode}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">Please arrive 10 minutes before your scheduled time.</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <p style="margin-bottom: 15px; color: #666;">Need to cancel?</p>
          <a href="${bookingUrl}" style="background-color: #dc3545; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Cancel Appointment</a>
        </div>
        
        <p style="color: #666; font-size: 14px;">If you have any questions, please contact us at our office.</p>
        <p>We look forward to seeing you today!</p>
      </div>
    `;

    return await this.sendEmail(
      booking.email,
      "Appointment Reminder - Today",
      html,
    );
  }
}

export default new EmailService();
