import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return Response.json(
        { error: "Phone and message are required" },
        { status: 400 }
      );
    }

    const hasTwilio = process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.startsWith("your_");

    if (hasTwilio) {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(
              `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
            )}`,
          },
          body: new URLSearchParams({
            To: `+1${phone.replace(/\D/g, "")}`,
            From: process.env.TWILIO_PHONE_NUMBER!,
            Body: message,
          }),
        }
      );

      const result = await response.json();
      return Response.json({ success: true, sid: result.sid });
    }

    // Mock mode
    console.log(`[SMS Mock] To: ${phone} — ${message}`);
    return Response.json({ success: true, mock: true });
  } catch (error) {
    console.error("Notification error:", error);
    return Response.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
