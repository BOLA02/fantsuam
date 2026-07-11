import prisma from "../../config/prisma";

class BranchRepository {
  async findAll() {
    return prisma.branch.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.branch.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByCode(branchCode: string) {
    return prisma.branch.findUnique({
      where: {
        branchCode,
      },
    });
  }

  async create(data: any) {
    return prisma.branch.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return prisma.branch.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.branch.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async countUsers(id: string) {
    return prisma.user.count({
      where: {
        branchId: id,
      },
    });
  }
}

export default new BranchRepository();