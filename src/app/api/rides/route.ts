import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const sb = getServiceClient();

  const { data, error } = await sb
    .from("ride_slots")
    .select("*")
    .in("status", ["open", "full"])
    .order("departure_time", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ rides: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { direction, departure_time, pickup_location, dropoff_location, capacity, price_cents } = body;

    if (!direction || !departure_time || !pickup_location || !dropoff_location || !capacity) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sb = getServiceClient();

    const { data, error } = await sb
      .from("ride_slots")
      .insert({
        direction,
        departure_time,
        pickup_location,
        dropoff_location,
        capacity,
        price_cents: price_cents || 3000,
        booked_count: 0,
        status: "open",
        vehicle_id: null,
        driver_id: null,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ride_slot: data });
  } catch (error) {
    console.error("Create ride error:", error);
    return Response.json({ error: "Failed to create ride" }, { status: 500 });
  }
}
