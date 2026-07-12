"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_repository_1 = require("./notification.repository");
const sms_provider_1 = require("./sms.provider");
function renderTemplate(template, variables) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => String(variables[key] ?? ''));
}
class NotificationService {
    repository = new notification_repository_1.NotificationRepository();
    provider = new sms_provider_1.AfricasTalkingProvider();
    /**
     * Fire-and-log SMS send. Never throws — a failed SMS must not break the
     * calling flow (payment, disbursement, etc.). Call this AFTER any related
     * DB transaction has already committed, never from inside one.
     */
    async sendSms(input) {
        try {
            const template = await this.repository.findTemplateByCode(input.templateCode);
            if (!template) {
                await this.repository.createSmsLog({
                    customerId: input.customerId,
                    phone: input.phone,
                    message: `[Missing template: ${input.templateCode}]`,
                    smsStatus: 'FAILED',
                });
                return;
            }
            const message = renderTemplate(template.message, input.variables);
            const log = await this.repository.createSmsLog({
                customerId: input.customerId,
                phone: input.phone,
                message,
                smsStatus: 'PENDING',
                templateId: template.id,
            });
            const result = await this.provider.send(input.phone, message);
            if (result.success) {
                await this.repository.updateSmsLog(log.id, {
                    smsStatus: 'SENT',
                    providerMessageId: result.providerMessageId,
                    sentAt: new Date(),
                });
            }
            else {
                await this.repository.updateSmsLog(log.id, { smsStatus: 'FAILED' });
            }
            if (input.customerId) {
                await this.repository.createNotification({
                    customerId: input.customerId,
                    title: template.name,
                    message,
                    type: 'SMS',
                });
            }
        }
        catch (err) {
            // Swallow — SMS is best-effort, never lets a caller's real operation fail.
            console.error('SMS send failed:', err);
        }
    }
    async getAllSms(query) {
        return this.repository.findAllSms(query);
    }
    async getTemplates() {
        return this.repository.findActiveTemplates();
    }
}
exports.NotificationService = NotificationService;
