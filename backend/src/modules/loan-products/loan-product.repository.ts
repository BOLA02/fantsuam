import prisma from '../../config/prisma';

export class ProductRepository {
  async create(data: any) {
    const { fees, requirements, ...productData } = data;
    
    return prisma.$transaction(async (tx) => {
      return tx.loanProduct.create({
        data: {
          ...productData,
          fees: fees ? { create: fees } : undefined,
          requirements: requirements ? { create: requirements } : undefined,
        },
        include: { fees: true, requirements: true }
      });
    });
  }

  async findAll() {
    return prisma.loanProduct.findMany({
      where: { deletedAt: null },
      include: { fees: true, requirements: true }
    });
  }

  async findById(id: string) {
    return prisma.loanProduct.findFirst({
      where: { id, deletedAt: null },
      include: { fees: true, requirements: true }
    });
  }

  async findByCode(productCode: string) {
    return prisma.loanProduct.findFirst({
      where: { productCode, deletedAt: null }
    });
  }

  async update(id: string, data: any) {
    const { fees, requirements, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      await tx.loanProduct.update({
        where: { id },
        data: productData
      });

      if (fees) {
        await tx.loanProductFee.deleteMany({ where: { loanProductId: id } });
        await tx.loanProductFee.createMany({
          data: fees.map((f: any) => ({ ...f, loanProductId: id }))
        });
      }

      if (requirements) {
        await tx.loanProductRequirement.deleteMany({ where: { loanProductId: id } });
        await tx.loanProductRequirement.createMany({
          data: requirements.map((r: any) => ({ ...r, loanProductId: id }))
        });
      }

      return tx.loanProduct.findUnique({
        where: { id },
        include: { fees: true, requirements: true }
      });
    });
  }

  async hasDependencies(id: string): Promise<boolean> {
    const product = await prisma.loanProduct.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true, loans: true }
        }
      }
    });

    if (!product) return false;
    return product._count.applications > 0 || product._count.loans > 0;
  }

  async softDelete(id: string) {
    return prisma.loanProduct.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
