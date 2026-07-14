"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    // src/modules/customers/customer.validation.ts
    // UPDATED — createCustomerSchema: branchId now optional. Rest of file unchanged.
    body: zod_1.z.object({
        customerNumber: zod_1.z.string().min(3),
        firstName: zod_1.z.string().min(2),
        lastName: zod_1.z.string().min(2),
        middleName: zod_1.z.string().optional(),
        gender: zod_1.z.enum(["MALE", "FEMALE"]),
        dateOfBirth: zod_1.z.coerce.date(),
        phone: zod_1.z.string().min(10),
        alternatePhone: zod_1.z.string().optional(),
        email: zod_1.z.string().email(),
        nationality: zod_1.z.string().optional(),
        bvn: zod_1.z.string().length(11, "BVN must be 11 digits").optional(),
        nin: zod_1.z.string().length(11, "NIN must be 11 digits").optional(),
        photoUrl: zod_1.z.string().optional(),
        branchId: zod_1.z.uuid({ message: "Invalid UUID format" }).optional(),
        address: zod_1.z.object({
            addressLine1: zod_1.z.string().min(3),
            addressLine2: zod_1.z.string().optional(),
            city: zod_1.z.string().min(2),
            state: zod_1.z.string().min(2),
            country: zod_1.z.string().min(2),
            postalCode: zod_1.z.string().optional(),
        }),
        employment: zod_1.z.object({
            employerName: zod_1.z.string().min(2),
            occupation: zod_1.z.string().min(2),
            monthlyIncome: zod_1.z.number().nonnegative(),
            employerAddress: zod_1.z.string().optional(),
            employmentDate: zod_1.z.coerce.date().optional(),
        }),
    }),
});
exports.updateCustomerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.uuid({ message: "Invalid Customer ID format" }),
    }),
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2).optional(),
        lastName: zod_1.z.string().min(2).optional(),
        middleName: zod_1.z.string().optional(),
        phone: zod_1.z.string().min(10).optional(),
        alternatePhone: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        status: zod_1.z.enum(["ACTIVE", "INACTIVE"]).optional(),
    }),
});
