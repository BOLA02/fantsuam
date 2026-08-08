import { NotificationRepository } from './notification.repository';
import { AfricasTalkingProvider } from './sms.provider';
import { SendSmsInput,SendEmailInput, ListSmsQuery } from './notification.types';
import { MailProvider } from './mail.provider';
function renderTemplate(template: string, variables: Record<string, string | number>): string {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => String(variables[key] ?? ''));
}

export class NotificationService {
  private repository = new NotificationRepository();
  private provider = new AfricasTalkingProvider();
  private mailProvider = new MailProvider(); 

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

/**
   * Fire-and-log email send. Mirrors sendSms — never throws, always logs.
   * Call AFTER any related DB transaction has committed.
   */
  async sendEmail(input: SendEmailInput): Promise<void> {
    try {
      const template = await this.repository.findEmailTemplateByCode(input.templateCode);

      if (!template) {
        await this.repository.createEmailLog({
          customerId: input.customerId,
          email: input.email,
          subject: `[Missing template: ${input.templateCode}]`,
          emailStatus: 'FAILED',
        });
        return;
      }

      const subject = renderTemplate(template.subject, input.variables);
      const html = renderTemplate(template.bodyHtml, input.variables);

      const log = await this.repository.createEmailLog({
        customerId: input.customerId,
        email: input.email,
        subject,
        emailStatus: 'PENDING',
        templateId: template.id,
      });

      const result = await this.mailProvider.send(input.email, subject, html);

      if (result.success) {
        await this.repository.updateEmailLog(log.id, {
          emailStatus: 'SENT',
          providerMessageId: result.providerMessageId,
          sentAt: new Date(),
        });
      } else {
        await this.repository.updateEmailLog(log.id, { emailStatus: 'FAILED' });
      }

      if (input.customerId) {
        await this.repository.createNotification({
          customerId: input.customerId,
          title: subject,
          message: html,
          type: 'EMAIL',
        });
      }
    } catch (err) {
      console.error('Email send failed:', err);
    }
  }
  async getAllSms(query: ListSmsQuery) {
    return this.repository.findAllSms(query);
  }

  async getTemplates() {
    return this.repository.findActiveTemplates();
  }
}
