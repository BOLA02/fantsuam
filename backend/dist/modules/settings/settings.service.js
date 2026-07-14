"use strict";
// src/modules/settings/settings.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const settings_repository_1 = __importDefault(require("./settings.repository"));
const DEFAULTS = {
    organizationName: "Fantsuam Foundation",
    email: "support@fantsuam.org",
    phone: "+234 803 000 0000",
};
class SettingsService {
    async getSettings() {
        const existing = await settings_repository_1.default.get();
        if (existing) {
            return existing;
        }
        return settings_repository_1.default.create(DEFAULTS);
    }
    async updateSettings(data) {
        const existing = await this.getSettings();
        return settings_repository_1.default.update(existing.id, data);
    }
}
exports.default = new SettingsService();
