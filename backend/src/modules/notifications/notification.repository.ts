import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';

type DbClient = typeof prisma | Prisma.TransactionClient;

export class NotificationRepository {
  async findTemplateByCode(code: string, client: DbClient = prisma) {
    return client.smsTemplate.findFirst({ where: { code, active: true } });
  }

  async createSmsLog(
    data: {
      customerId?: string;
      phone: string;
      message: string;
      smsStatus: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
      templateId?: string;
      providerMessageId?: string;
      sentAt?: Date;
    },
    client: DbClient = prisma
  ) {
    return client.smsLog.create({ data });
  }

  async updateSmsLog(
    id: string,
    data: { smsStatus: 'SENT' | 'FAILED'; providerMessageId?: string; sentAt?: Date },
    client: DbClient = prisma
  ) {
    return client.smsLog.update({ where: { id }, data });
  }

  async createNotification(
    data: { customerId?: string; title: string; message: string; type: 'SMS' | 'EMAIL' | 'PUSH' },
    client: DbClient = prisma
  ) {
    return client.notification.create({ data });
  }

  async findAllSms(query: { search?: string; status?: string; page?: number; pageSize?: number }) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;

    const where: Prisma.SmsLogWhereInput = {
      ...(query.status ? { smsStatus: query.status as any } : {}),
      ...(query.search
        ? {
            OR: [
              { phone: { contains: query.search } },
              { message: { contains: query.search } },
            ],
          }
        : {}),
    };

    return prisma.smsLog.findMany({
      where,
      include: { template: true, customer: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findActiveTemplates() {
    return prisma.smsTemplate.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }
}