import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const { stripe } = await import("@/lib/stripe-server");

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { ride_slot_id, name, phone, num_passengers } =
          session.metadata || {};

        console.log("Payment completed:", {
          ride_slot_id,
          name,
          phone,
          num_passengers,
          amount: session.amount_total,
        });

        // In production:
        // 1. Update booking status to "confirmed"
        // 2. Increment ride_slot.booked_count
        // 3. Send SMS confirmation via Twilio
        // 4. Send email receipt

        // Send SMS confirmation
        if (phone && process.env.TWILIO_ACCOUNT_SID) {
          try {
            const twilioResponse = await fetch(
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
                  Body: `🤙 12th Van confirmed! ${name}, you're booked for ${num_passengers} seat(s). Check your email for details. Gig 'em!`,
                }),
              }
            );
            console.log("SMS sent:", twilioResponse.status);
          } catch (smsError) {
            console.error("SMS send failed:", smsError);
          }
        }

        break;
      }

      case "charge.refunded": {
        console.log("Refund processed:", event.data.object.id);
        // In production: update booking status, send refund notification
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook failed" }, { status: 400 });
  }
}
