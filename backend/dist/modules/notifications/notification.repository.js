"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class NotificationRepository {
    async findTemplateByCode(code, client = prisma_1.default) {
        return client.smsTemplate.findFirst({ where: { code, active: true } });
    }
    async createSmsLog(data, client = prisma_1.default) {
        return client.smsLog.create({ data });
    }
    async updateSmsLog(id, data, client = prisma_1.default) {
        return client.smsLog.update({ where: { id }, data });
    }
    async createNotification(data, client = prisma_1.default) {
        return client.notification.create({ data });
    }
    async findAllSms(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 50;
        const where = {
            ...(query.status ? { smsStatus: query.status } : {}),
            ...(query.search
                ? {
                    OR: [
                        { phone: { contains: query.search } },
                        { message: { contains: query.search } },
                    ],
                }
                : {}),
        };
        return prisma_1.default.smsLog.findMany({
            where,
            include: { template: true, customer: { select: { id: true, firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
    }
    async findActiveTemplates() {
        return prisma_1.default.smsTemplate.findMany({
            where: { active: true },
            orderBy: { name: 'asc' },
        });
    }
}
exports.NotificationRepository = NotificationRepository;
