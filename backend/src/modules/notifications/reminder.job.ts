import cron from 'node-cron';
import prisma from '../../config/prisma';
import { NotificationService } from './notification.service';

const notifications = new NotificationService();
const REMINDER_DAYS_BEFORE_DUE = 2;

async function hasReminderBeenSentToday(phone: string): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await prisma.smsLog.findFirst({
    where: {
      phone,
      template: { code: 'REPAYMENT_REMINDER' },
      createdAt: { gte: startOfDay },
    },
  });
  return !!existing;
}

export async function runReminderJob() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + REMINDER_DAYS_BEFORE_DUE);
  const startOfTarget = new Date(targetDate);
  startOfTarget.setHours(0, 0, 0, 0);
  const endOfTarget = new Date(targetDate);
  endOfTarget.setHours(23, 59, 59, 999);

  const dueSoon = await prisma.repaymentSchedule.findMany({
    where: {
      status: { in: ['PENDING', 'PARTIALLY_PAID'] },
      dueDate: { gte: startOfTarget, lte: endOfTarget },
    },
    include: { loan: { include: { customer: true } } },
  });

  for (const schedule of dueSoon) {
    const customer = schedule.loan.customer;
    if (!customer?.phone) continue;

    const alreadySent = await hasReminderBeenSentToday(customer.phone);
    if (alreadySent) continue;

    await notifications.sendSms({
      customerId: customer.id,
      phone: customer.phone,
      templateCode: 'REPAYMENT_REMINDER',
      variables: {
        firstName: customer.firstName,
        amount: Number(schedule.totalAmount),
        loanNumber: schedule.loan.loanNumber,
        dueDate: schedule.dueDate.toLocaleDateString(),
      },
    });
  }
}

/** Runs daily at 8:00 AM server time. Call registerReminderJob() once, in server.ts. */
export function registerReminderJob() {
  cron.schedule('0 8 * * *', () => {
    runReminderJob().catch((err) => console.error('Reminder job failed:', err));
  }, { timezone: 'Africa/Lagos' });
}