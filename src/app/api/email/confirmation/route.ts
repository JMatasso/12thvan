import { NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking, rideSlot, friends } = body;

    if (!booking || !rideSlot) {
      return Response.json({ error: "Missing booking or ride data" }, { status: 400 });
    }

    const direction = rideSlot.direction === "to_snook" ? "To Chilifest" : "To College Station";
    const departureDate = new Date(rideSlot.departure_time).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const departureTime = new Date(rideSlot.departure_time).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const totalPrice = `$${(booking.total_price_cents / 100).toFixed(0)}`;

    const friendsList = friends?.length
      ? friends.map((f: { name: string }) => f.name).join(", ")
      : "None";

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #500000; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">12th Van</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Ride Confirmation</p>
        </div>

        <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 18px; font-weight: bold; margin-top: 0;">Hey ${booking.rider_name}! You're booked.</p>

          <div style="background: #f9f5f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;">Direction</td>
                <td style="padding: 8px 0; font-weight: bold;">${direction}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Date</td>
                <td style="padding: 8px 0; font-weight: bold;">${departureDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Time</td>
                <td style="padding: 8px 0; font-weight: bold;">${departureTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Pickup</td>
                <td style="padding: 8px 0; font-weight: bold;">${rideSlot.pickup_location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Drop-off</td>
                <td style="padding: 8px 0; font-weight: bold;">${rideSlot.dropoff_location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Passengers</td>
                <td style="padding: 8px 0; font-weight: bold;">${booking.num_passengers}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Friends</td>
                <td style="padding: 8px 0; font-weight: bold;">${friendsList}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Total</td>
                <td style="padding: 8px 0; font-weight: bold; font-size: 18px;">${totalPrice}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; color: #856404;">Payment is collected in person</p>
            <p style="margin: 8px 0 0; color: #856404; font-size: 14px;">
              Please bring <strong>cash or tap-to-pay</strong> for ${totalPrice}. Your driver will collect payment at pickup.
            </p>
          </div>

          <h3 style="margin: 24px 0 8px;">What to do:</h3>
          <ul style="color: #555; line-height: 1.8;">
            <li>Show up at the pickup location <strong>5 minutes early</strong></li>
            <li>Bring your payment — <strong>cash or tap</strong></li>
            <li>Have your confirmation email ready to show the driver</li>
          </ul>

          <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">
            Gig 'em! — 12th Van Team
          </p>
        </div>
      </div>
    `;

    // Send to the main booker
    const emails = [booking.rider_email];

    // Also send to friends who have email addresses
    if (friends?.length) {
      for (const friend of friends) {
        if (friend.email) {
          emails.push(friend.email);
        }
      }
    }

    const hasResend = process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("your_");

    if (hasResend) {
      await resend.emails.send({
        from: "12th Van <onboarding@resend.dev>",
        to: emails,
        subject: `12th Van — Ride Confirmed (${direction}, ${departureDate})`,
        html: emailHtml,
      });
    } else {
      console.log("Resend not configured — would send confirmation to:", emails);
    }

    return Response.json({ success: true, sent_to: emails });
  } catch (error) {
    console.error("Email error:", error);
    return Response.json({ error: "Failed to send confirmation email" }, { status: 500 });
  }
}
