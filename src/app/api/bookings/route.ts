import { NextRequest } from "next/server";
import { bookingSchema } from "@/lib/validators";
import { SITE_NAME } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid booking data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, num_passengers, ride_slot_id } = parsed.data;

    // In production: check Supabase for slot availability, create booking record,
    // then create Stripe checkout session
    // For now, return mock success with Stripe checkout URL placeholder

    const hasStripe = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith("your_");

    if (hasStripe) {
      const { stripe } = await import("@/lib/stripe-server");

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${SITE_NAME} — Ride to Chilifest`,
                description: `${num_passengers} passenger(s)`,
              },
              unit_amount: 3000,
            },
            quantity: num_passengers,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirm?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book`,
        customer_email: email,
        metadata: {
          ride_slot_id,
          name,
          phone,
          num_passengers: String(num_passengers),
        },
      });

      return Response.json({ checkout_url: session.url });
    }

    // Mock mode — return success directly
    return Response.json({
      booking_id: `mock_${Date.now()}`,
      status: "confirmed",
      message: "Booking confirmed (demo mode — Stripe not configured)",
    });
  } catch (error) {
    console.error("Booking error:", error);
    return Response.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return mock bookings for admin dashboard
  const { mockBookings } = await import("@/lib/mock-data");
  return Response.json({ bookings: mockBookings });
}
