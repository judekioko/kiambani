import "server-only";

export type SendSmsResult = {
  configured: boolean;
  sent: number;
  failed: number;
  error?: string;
};

export async function sendSms(recipients: string[], message: string): Promise<SendSmsResult> {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME || "sandbox";

  if (!apiKey || recipients.length === 0) {
    return { configured: false, sent: 0, failed: recipients.length };
  }

  try {
    const body = new URLSearchParams({
      username,
      to: recipients.join(","),
      message,
    });
    if (process.env.AFRICASTALKING_SENDER_ID) {
      body.set("from", process.env.AFRICASTALKING_SENDER_ID);
    }

    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    });

    if (!response.ok) {
      return { configured: true, sent: 0, failed: recipients.length, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const recipientResults: { status: string }[] = data?.SMSMessageData?.Recipients ?? [];
    const sent = recipientResults.filter((r) => r.status === "Success").length;
    return { configured: true, sent, failed: recipients.length - sent };
  } catch (err) {
    return {
      configured: true,
      sent: 0,
      failed: recipients.length,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
