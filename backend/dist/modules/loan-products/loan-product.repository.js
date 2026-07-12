"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class ProductRepository {
    async create(data) {
        const { fees, requirements, ...productData } = data;
        return prisma_1.default.$transaction(async (tx) => {
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
        return prisma_1.default.loanProduct.findMany({
            where: { deletedAt: null },
            include: { fees: true, requirements: true }
        });
    }
    async findById(id) {
        return prisma_1.default.loanProduct.findFirst({
            where: { id, deletedAt: null },
            include: { fees: true, requirements: true }
        });
    }
    async findByCode(productCode) {
        return prisma_1.default.loanProduct.findFirst({
            where: { productCode, deletedAt: null }
        });
    }
    async update(id, data) {
        const { fees, requirements, ...productData } = data;
        return prisma_1.default.$transaction(async (tx) => {
            await tx.loanProduct.update({
                where: { id },
                data: productData
            });
            if (fees) {
                await tx.loanProductFee.deleteMany({ where: { loanProductId: id } });
                await tx.loanProductFee.createMany({
                    data: fees.map((f) => ({ ...f, loanProductId: id }))
                });
            }
            if (requirements) {
                await tx.loanProductRequirement.deleteMany({ where: { loanProductId: id } });
                await tx.loanProductRequirement.createMany({
                    data: requirements.map((r) => ({ ...r, loanProductId: id }))
                });
            }
            return tx.loanProduct.findUnique({
                where: { id },
                include: { fees: true, requirements: true }
            });
        });
    }
    async hasDependencies(id) {
        const product = await prisma_1.default.loanProduct.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { applications: true, loans: true }
                }
            }
        });
        if (!product)
            return false;
        return product._count.applications > 0 || product._count.loans > 0;
    }
    async softDelete(id) {
        return prisma_1.default.loanProduct.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
exports.ProductRepository = ProductRepository;
