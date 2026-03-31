import PDFDocument from "pdfkit";

export async function generateBookingPDF(booking: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            console.log("starting pdf generation")

            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);

            // Header
            doc.fontSize(20).text("Booking Confirmation", { align: "center" });
            doc.moveDown();

            // Greeting
            doc.fontSize(12).text(`Dear ${booking.firstName} ${booking.lastName},`, { align: "left" });
            doc.moveDown();
            doc.text("Thank you for your appointment. Your booking has been confirmed.", { align: "left" });
            doc.moveDown();

            // Booking Details Box
            doc.rect(50, doc.y, 500, 160).stroke();
            const startY = doc.y + 15;
            const leftColX = 70;

            doc.fontSize(14).text("Appointment Details", 70, startY - 5, { underline: true });

            const detailsY = startY + 30;
            doc.fontSize(10);
            doc.text(`Reference Number:`, leftColX, detailsY);
            doc.text(booking.bookingReference, 200, detailsY);

            doc.text(`Type:`, leftColX, detailsY + 20);
            doc.text(booking.appointmentType.typeName, 200, detailsY + 20);

            doc.text(`Date:`, leftColX, detailsY + 40);
            doc.text(new Date(booking.appointmentDate).toLocaleDateString(), 200, detailsY + 40);

            doc.text(`Time:`, leftColX, detailsY + 60);
            doc.text(booking.appointmentTime, 200, detailsY + 60);

            doc.text(`Location:`, leftColX, detailsY + 80);
            doc.text(booking.location.locationName, 200, detailsY + 80);

            doc.text(`Address:`, leftColX, detailsY + 100);
            doc.text(`${booking.location.address}, ${booking.location.city}, ${booking.location.state} ${booking.location.zipCode}`, 200, detailsY + 100);

            // Footer
            doc.moveDown(8);
            doc.fontSize(10).text("Please arrive 10 minutes before your scheduled time.", { align: "center", oblique: true });
            doc.text("Thank you for choosing our service!", { align: "center" });

            doc.end();
        }
        catch (err) {
            console.log(err);
            reject(err);
        }

    });
}