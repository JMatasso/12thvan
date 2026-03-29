import { NextRequest } from "next/server";
import { rideSlotSchema } from "@/lib/validators";

export async function GET() {
  const { mockRideSlots, mockVehicles } = await import("@/lib/mock-data");

  const enriched = mockRideSlots.map((slot) => ({
    ...slot,
    vehicle: mockVehicles.find((v) => v.id === slot.vehicle_id),
  }));

  return Response.json({ rides: enriched });
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

    // In production: insert into Supabase
    return Response.json({
      ride_slot: { id: `mock_${Date.now()}`, ...parsed.data, booked_count: 0, status: "open" },
      message: "Ride slot created (demo mode)",
    });
  } catch (error) {
    console.error("Create ride error:", error);
    return Response.json({ error: "Failed to create ride" }, { status: 500 });
  }
}
