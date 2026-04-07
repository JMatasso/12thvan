import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { auth_id, name, email, phone } = await request.json();

    if (!auth_id || !name || !email) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sb = getServiceClient();

    // Check if user already exists
    const { data: existing } = await sb
      .from("users")
      .select("id")
      .eq("auth_id", auth_id)
      .maybeSingle();

    if (existing) {
      return Response.json({ success: true, user_id: existing.id });
    }

    const { data, error } = await sb
      .from("users")
      .insert({
        auth_id,
        name,
        email,
        phone: phone || null,
        role: "rider",
      })
      .select("id")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, user_id: data.id });
  } catch (error) {
    console.error("Create profile error:", error);
    return Response.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
