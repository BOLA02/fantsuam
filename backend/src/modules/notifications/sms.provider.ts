const AT_BASE_URL =
  process.env.AT_ENV === 'production'
    ? 'https://api.africastalking.com/version1/messaging'
    : 'https://api.sandbox.africastalking.com/version1/messaging';

export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export class AfricasTalkingProvider {
  async send(to: string, message: string): Promise<SendResult> {
    const apiKey = process.env.AT_API_KEY;
    const username = process.env.AT_USERNAME;

    if (!apiKey || !username) {
      return { success: false, error: "Africa's Talking credentials not configured" };
    }

    try {
      const res = await fetch(AT_BASE_URL, {
        method: 'POST',
        headers: {
          apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({ username, to, message }).toString(),
      });

      const data: any = await res.json();
      const recipient = data?.SMSMessageData?.Recipients?.[0];

      if (recipient?.status === 'Success') {
        return { success: true, providerMessageId: recipient.messageId };
      }
      return { success: false, error: recipient?.status || 'Unknown provider response' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error contacting SMS provider' };
    }
  }
}