// src/modules/guarantors/guarantor.repository.ts

import prisma from "../../config/prisma";

class GuarantorRepository {
  async findAll(customerId?: string) {
    return prisma.guarantor.findMany({
      where: {
        customerId: customerId || undefined,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.guarantor.findUnique({
      where: { id },
      include: {
        customer: true,
        documents: true,
      },
    });
  }

  async create(data: {
    customerId: string;
    fullName: string;
    relationship: string;
    phone: string;
    email?: string;
    occupation?: string;
    address: string;
  }) {
    return prisma.guarantor.create({
      data,
      include: {
        customer: true,
      },
    });
  }

  async update(id: string, data: Record<string, any>) {
    return prisma.guarantor.update({
      where: { id },
      data,
      include: {
        customer: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.guarantor.delete({
      where: { id },
    });
  }

  async countByCustomer(customerId: string) {
    return prisma.guarantor.count({
      where: { customerId },
    });
  }
}

export default new GuarantorRepository();