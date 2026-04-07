import { NextRequest } from "next/server";
import { rideSlotSchema } from "@/lib/validators";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const sb = getServiceClient();

  const { data, error } = await sb
    .from("ride_slots")
    .select(`
      *,
      vehicle:vehicles(*),
      driver:users!ride_slots_driver_id_fkey(id, name, phone, photo_url)
    `)
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
    const parsed = rideSlotSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid ride slot data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const sb = getServiceClient();

    const { data, error } = await sb
      .from("ride_slots")
      .insert({
        ...parsed.data,
        booked_count: 0,
        status: "open",
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
