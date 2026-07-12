"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
class CustomerRepository {
    async findAll() {
        return prisma_1.default.customer.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                branch: true,
                loans: true,
                addresses: true, // ✨ Included for complete visual visibility
                employments: true, // ✨ Included for complete visual visibility
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findById(id) {
        return prisma_1.default.customer.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                branch: true,
                loans: true,
                guarantors: true,
                documents: true,
                addresses: true, // ✨ Include nested table records
                employments: true, // ✨ Include nested table records
            },
        });
    }
    async findByCustomerNumber(customerNumber) {
        return prisma_1.default.customer.findUnique({
            where: {
                customerNumber,
            },
        });
    }
    async findByPhone(phone) {
        return prisma_1.default.customer.findUnique({
            where: {
                phone,
            },
        });
    }
    async findByEmail(email) {
        return prisma_1.default.customer.findUnique({
            where: {
                email,
            },
        });
    }
    async create(data) {
        // 1. Extract sub-objects out of the request body
        const { address, employment, ...customerProfile } = data;
        // 2. Perform the relational multi-table database save loop
        return prisma_1.default.customer.create({
            data: {
                ...customerProfile,
                addresses: address ? {
                    create: {
                        addressLine1: address.addressLine1,
                        addressLine2: address.addressLine2,
                        city: address.city,
                        state: address.state,
                        country: address.country,
                        postalCode: address.postalCode,
                        isPrimary: true,
                    }
                } : undefined,
                employments: employment ? {
                    create: {
                        employerName: employment.employerName,
                        occupation: employment.occupation,
                        monthlyIncome: employment.monthlyIncome,
                        employerAddress: employment.employerAddress,
                        // 👇 FORCE NATIVE DATE CONVERSION HERE
                        employmentDate: employment.employmentDate ? new Date(employment.employmentDate) : null,
                        isCurrent: true,
                    }
                } : undefined
            },
            include: {
                branch: true,
                addresses: true,
                employments: true
            },
        });
    }
    async update(id, data) {
        // 1. Separate out the flat input parameters from the main profile values
        const { occupation, employer, monthlyIncome, address, city, state, country, ...baseProfile } = data;
        // 2. Prepare employment nested update parameters if fields are present
        const employmentUpdate = {};
        if (occupation)
            employmentUpdate.occupation = occupation;
        if (employer)
            employmentUpdate.employerName = employer;
        if (monthlyIncome)
            employmentUpdate.monthlyIncome = monthlyIncome;
        // 3. Prepare address nested update parameters if fields are present
        const addressUpdate = {};
        if (address)
            addressUpdate.addressLine1 = address;
        if (city)
            addressUpdate.city = city;
        if (state)
            addressUpdate.state = state;
        if (country)
            addressUpdate.country = country;
        return prisma_1.default.customer.update({
            where: {
                id,
            },
            data: {
                ...baseProfile, // Updates firstName, lastName, phone, status, etc.
                // 👇 Targets and updates the row inside CustomerEmployment table
                employments: Object.keys(employmentUpdate).length > 0 ? {
                    updateMany: {
                        where: { isCurrent: true },
                        data: employmentUpdate
                    }
                } : undefined,
                // 👇 Targets and updates the row inside CustomerAddress table
                addresses: Object.keys(addressUpdate).length > 0 ? {
                    updateMany: {
                        where: { isPrimary: true },
                        data: addressUpdate
                    }
                } : undefined
            },
            include: {
                branch: true,
                addresses: true,
                employments: true
            },
        });
    }
    async softDelete(id) {
        return prisma_1.default.customer.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }
    async search(keyword) {
        return prisma_1.default.customer.findMany({
            where: {
                deletedAt: null,
                OR: [
                    {
                        customerNumber: {
                            contains: keyword,
                        },
                    },
                    {
                        firstName: {
                            contains: keyword,
                        },
                    },
                    {
                        lastName: {
                            contains: keyword,
                        },
                    },
                    {
                        phone: {
                            contains: keyword,
                        },
                    },
                    {
                        email: {
                            contains: keyword,
                        },
                    },
                ],
            },
            include: {
                branch: true,
            },
        });
    }
}
exports.default = new CustomerRepository();
