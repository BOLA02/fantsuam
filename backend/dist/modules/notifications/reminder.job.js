"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runReminderJob = runReminderJob;
exports.registerReminderJob = registerReminderJob;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const notification_service_1 = require("./notification.service");
const notifications = new notification_service_1.NotificationService();
const REMINDER_DAYS_BEFORE_DUE = 2;
async function hasReminderBeenSentToday(phone) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const existing = await prisma_1.default.smsLog.findFirst({
        where: {
            phone,
            template: { code: 'REPAYMENT_REMINDER' },
            createdAt: { gte: startOfDay },
        },
    });
    return !!existing;
}
async function runReminderJob() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + REMINDER_DAYS_BEFORE_DUE);
    const startOfTarget = new Date(targetDate);
    startOfTarget.setHours(0, 0, 0, 0);
    const endOfTarget = new Date(targetDate);
    endOfTarget.setHours(23, 59, 59, 999);
    const dueSoon = await prisma_1.default.repaymentSchedule.findMany({
        where: {
            status: { in: ['PENDING', 'PARTIALLY_PAID'] },
            dueDate: { gte: startOfTarget, lte: endOfTarget },
        },
        include: { loan: { include: { customer: true } } },
    });
    for (const schedule of dueSoon) {
        const customer = schedule.loan.customer;
        if (!customer?.phone)
            continue;
        const alreadySent = await hasReminderBeenSentToday(customer.phone);
        if (alreadySent)
            continue;
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
function registerReminderJob() {
    node_cron_1.default.schedule('0 8 * * *', () => {
        runReminderJob().catch((err) => console.error('Reminder job failed:', err));
    }, { timezone: 'Africa/Lagos' });
}
