import { NextRequest } from "next/server";
import { bookingSchema } from "@/lib/validators";
import { getServiceClient } from "@/lib/supabase";

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

    const { name, email, phone, num_passengers, ride_slot_id, friends } = parsed.data;

    const sb = getServiceClient();

    // Look up the ride slot
    const { data: slot, error: slotError } = await sb
      .from("ride_slots")
      .select("*")
      .eq("id", ride_slot_id)
      .single();

    if (slotError || !slot) {
      return Response.json({ error: "Ride not found" }, { status: 404 });
    }

    if (slot.status !== "open") {
      return Response.json({ error: "This ride is no longer available" }, { status: 400 });
    }

    const remaining = slot.capacity - slot.booked_count;
    if (remaining < num_passengers) {
      return Response.json({ error: `Only ${remaining} seat(s) available` }, { status: 400 });
    }

    // Find or create user by email
    let { data: user } = await sb
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (!user) {
      const { data: newUser, error: userError } = await sb
        .from("users")
        .insert({ name, email, phone, role: "rider" })
        .select("id")
        .single();
      if (userError) {
        return Response.json({ error: "Failed to create user" }, { status: 500 });
      }
      user = newUser;
    }

    const totalPriceCents = slot.price_cents * num_passengers;

    // Create the booking as PENDING (admin must confirm)
    const { data: booking, error: bookingError } = await sb
      .from("bookings")
      .insert({
        user_id: user.id,
        ride_slot_id,
        num_passengers,
        total_price_cents: totalPriceCents,
        rider_name: name,
        rider_email: email,
        rider_phone: phone,
        status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      return Response.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // Add friends
    const validFriends = (friends || []).filter((f: { name: string }) => f.name.trim());
    if (validFriends.length > 0) {
      await sb.from("booking_friends").insert(
        validFriends.map((f: { name: string; email?: string; phone?: string }) => ({
          booking_id: booking.id,
          name: f.name,
          email: f.email || null,
          phone: f.phone || null,
        }))
      );
    }

    return Response.json({
      booking_id: booking.id,
      status: "pending",
      booking: {
        ...booking,
        ride_slot: slot,
        friends: validFriends,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);
    return Response.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sb = getServiceClient();
  const userId = request.nextUrl.searchParams.get("user_id");

  if (userId) {
    const { data, error } = await sb
      .from("bookings")
      .select(`
        *,
        ride_slot:ride_slots(*),
        friends:booking_friends(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ bookings: data });
  }

  // Admin: return all bookings
  const { data, error } = await sb
    .from("bookings")
    .select(`
      *,
      ride_slot:ride_slots(*),
      friends:booking_friends(*)
    `)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ bookings: data });
}

// Admin: confirm or deny a booking
export async function PATCH(request: NextRequest) {
  try {
    const { booking_id, action } = await request.json();

    if (!booking_id || !["confirm", "deny"].includes(action)) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const sb = getServiceClient();

    if (action === "confirm") {
      // Get the booking to know how many seats to book
      const { data: booking } = await sb
        .from("bookings")
        .select("*")
        .eq("id", booking_id)
        .single();

      if (!booking) return Response.json({ error: "Booking not found" }, { status: 404 });
      if (booking.status !== "pending") return Response.json({ error: "Booking is not pending" }, { status: 400 });

      // Book the seats atomically
      const { data: seatsOk, error: seatsError } = await sb.rpc("book_seats", {
        p_ride_slot_id: booking.ride_slot_id,
        p_num_passengers: booking.num_passengers,
      });

      if (seatsError || !seatsOk) {
        return Response.json({ error: "Not enough seats available" }, { status: 400 });
      }

      // Confirm the booking
      await sb
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", booking_id);

      return Response.json({ success: true, status: "confirmed" });
    } else {
      // Deny the booking
      await sb
        .from("bookings")
        .update({ status: "denied" })
        .eq("id", booking_id);

      return Response.json({ success: true, status: "denied" });
    }
  } catch (error) {
    console.error("Booking action error:", error);
    return Response.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
