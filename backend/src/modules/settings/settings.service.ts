// src/modules/settings/settings.service.ts

import settingsRepository from "./settings.repository";

const DEFAULTS = {
  organizationName: "Fantsuam Foundation",
  email: "support@fantsuam.org",
  phone: "+234 803 000 0000",
  applicationFeeEnabled: false,
  applicationFeeAmount: 0,
};

class SettingsService {
  async getSettings() {
    const existing = await settingsRepository.get();

    if (existing) {
      return existing;
    }

    return settingsRepository.create(DEFAULTS);
  }

  async updateSettings(data: Partial<typeof DEFAULTS>) {
    const existing = await this.getSettings();

    return settingsRepository.update(existing.id, data);
  }
}

export default new SettingsService();
