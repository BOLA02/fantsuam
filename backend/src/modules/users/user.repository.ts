import prisma from "../../config/prisma";

class UserRepository {
  async findAll() {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        branch: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        branch: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByEmployeeNumber(employeeNumber: string) {
    return prisma.user.findUnique({
      where: {
        employeeNumber,
      },
    });
  }

  async create(data: any) {
    return prisma.user.create({
      data,
      include: {
        branch: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
      include: {
        branch: true,
      },
    });
  }

  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        passwordHash,
      },
    });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export default new UserRepository();