import app from "./app";
import dotenv from "dotenv";
import "./workers/emailWorker";
import cronService from "./services/cron.service";
dotenv.config();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);

  // Start cron jobs
  cronService.startDailyReminderJob();
});
