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

    // Look up the ride slot to get pricing
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

    // Atomically book seats
    const { data: seatsOk, error: seatsError } = await sb.rpc("book_seats", {
      p_ride_slot_id: ride_slot_id,
      p_num_passengers: num_passengers,
    });

    if (seatsError || !seatsOk) {
      return Response.json({ error: "Not enough seats available" }, { status: 400 });
    }

    const totalPriceCents = slot.price_cents * num_passengers;

    // Create the booking
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
        status: "confirmed",
      })
      .select()
      .single();

    if (bookingError) {
      // Release seats on failure
      await sb.rpc("release_seats", {
        p_ride_slot_id: ride_slot_id,
        p_num_passengers: num_passengers,
      });
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

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking,
          rideSlot: slot,
          friends: validFriends,
        }),
      });
    } catch {
      console.error("Failed to send confirmation email, booking still created");
    }

    return Response.json({
      booking_id: booking.id,
      status: "confirmed",
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
        ride_slot:ride_slots(
          *,
          vehicle:vehicles(*),
          driver:users!ride_slots_driver_id_fkey(id, name, phone, photo_url)
        ),
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
