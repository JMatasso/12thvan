import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // In production: update ride slot in Supabase
  // Validate that only allowed fields are updated (status, departure_time, etc.)
  const allowedFields = ["status", "departure_time", "capacity", "price_cents"];
  const updates: Record<string, unknown> = {};

  for (const key of allowedFields) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  return Response.json({
    ride_slot: { id, ...updates },
    message: "Ride slot updated (demo mode)",
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // In production: delete from Supabase, refund any bookings
  return Response.json({
    message: `Ride slot ${id} deleted (demo mode)`,
  });
}
