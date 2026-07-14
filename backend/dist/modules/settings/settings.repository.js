"use strict";
// src/modules/settings/settings.repository.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../config/prisma"));
class SettingsRepository {
    async get() {
        return prisma_1.default.organizationSettings.findFirst();
    }
    async create(data) {
        return prisma_1.default.organizationSettings.create({ data });
    }
    async update(id, data) {
        return prisma_1.default.organizationSettings.update({
            where: { id },
            data,
        });
    }
}
exports.default = new SettingsRepository();
