// src/modules/settings/settings.repository.ts

import prisma from "../../config/prisma";

class SettingsRepository {
  async get() {
    return prisma.organizationSettings.findFirst();
  }

  async create(data: {
    organizationName: string;
    email: string;
    phone: string;
    applicationFeeEnabled?: boolean;
    applicationFeeAmount?: number;
  }) {
    return prisma.organizationSettings.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      organizationName: string;
      email: string;
      phone: string;
      applicationFeeEnabled: boolean;
      applicationFeeAmount: number;
    }>
  ) {
    return prisma.organizationSettings.update({
      where: { id },
      data,
    });
  }
}

export default new SettingsRepository();
