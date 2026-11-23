import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { registerReminderJob } from "./modules/notifications/reminder.job";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  if (process.env.ENABLE_REMINDER_JOB === "true") {
    registerReminderJob();
    console.log("Repayment reminder job scheduled (daily 8:00 AM)");
  } else {
    console.log("Repayment reminder job disabled");
  }
});