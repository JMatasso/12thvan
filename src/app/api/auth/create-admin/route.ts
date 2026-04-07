import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, role } = await request.json();

    if (!name || !email || !password) {
      return Response.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const validRoles = ["admin", "driver", "rider"];
    if (role && !validRoles.includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    const sb = getServiceClient();

    // Create the Supabase Auth account
    const { data: authData, error: authError } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return Response.json({ error: authError.message }, { status: 500 });
    }

    if (!authData.user) {
      return Response.json({ error: "Failed to create auth account" }, { status: 500 });
    }

    // Create the user profile
    const { data: profile, error: profileError } = await sb
      .from("users")
      .insert({
        auth_id: authData.user.id,
        name,
        email,
        phone: phone || null,
        role: role || "admin",
      })
      .select()
      .single();

    if (profileError) {
      return Response.json({ error: profileError.message }, { status: 500 });
    }

    return Response.json({ success: true, user: profile });
  } catch (error) {
    console.error("Create admin error:", error);
    return Response.json({ error: "Failed to create account" }, { status: 500 });
  }
}
