"use strict";
// src/modules/settings/settings.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const settings_service_1 = __importDefault(require("./settings.service"));
class SettingsController {
    async get(req, res, next) {
        try {
            const settings = await settings_service_1.default.getSettings();
            res.status(200).json({
                success: true,
                data: settings,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const settings = await settings_service_1.default.updateSettings(req.body);
            res.status(200).json({
                success: true,
                message: "Organization settings updated successfully",
                data: settings,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new SettingsController();
