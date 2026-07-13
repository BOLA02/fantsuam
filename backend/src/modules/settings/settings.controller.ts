// src/modules/settings/settings.controller.ts

import { Request, Response, NextFunction } from "express";
import settingsService from "./settings.service";

class SettingsController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings();

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updateSettings(req.body);

      res.status(200).json({
        success: true,
        message: "Organization settings updated successfully",
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();