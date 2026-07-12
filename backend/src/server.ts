import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { registerReminderJob } from "./modules/notifications/reminder.job";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  registerReminderJob();
  console.log("Repayment reminder job scheduled (daily 8:00 AM)");
});