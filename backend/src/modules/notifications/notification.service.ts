import { NotificationRepository } from './notification.repository';
import { AfricasTalkingProvider } from './sms.provider';
import { SendSmsInput, ListSmsQuery } from './notification.types';

function renderTemplate(template: string, variables: Record<string, string | number>): string {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => String(variables[key] ?? ''));
}

export class NotificationService {
  private repository = new NotificationRepository();
  private provider = new AfricasTalkingProvider();

  /**
   * Fire-and-log SMS send. Never throws — a failed SMS must not break the
   * calling flow (payment, disbursement, etc.). Call this AFTER any related
   * DB transaction has already committed, never from inside one.
   */
  async sendSms(input: SendSmsInput): Promise<void> {
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
      } else {
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
    } catch (err) {
      // Swallow — SMS is best-effort, never lets a caller's real operation fail.
      console.error('SMS send failed:', err);
    }
  }

  async getAllSms(query: ListSmsQuery) {
    return this.repository.findAllSms(query);
  }

  async getTemplates() {
    return this.repository.findActiveTemplates();
  }
}