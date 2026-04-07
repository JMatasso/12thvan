import { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return Response.json({ user: null }, { status: 401 });
  }

  try {
    const sb = getServiceClient();

    // Verify the token and get the auth user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: authUser }, error: authError } = await sb.auth.getUser(token);

    if (authError || !authUser) {
      return Response.json({ user: null }, { status: 401 });
    }

    // Fetch the profile using service role (bypasses RLS)
    const { data: profile, error: profileError } = await sb
      .from("users")
      .select("*")
      .eq("auth_id", authUser.id)
      .maybeSingle();

    if (profileError || !profile) {
      return Response.json({ user: null });
    }

    return Response.json({
      user: {
        id: profile.id,
        auth_id: profile.auth_id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        photo_url: profile.photo_url,
        bio: profile.bio,
      },
    });
  } catch {
    return Response.json({ user: null }, { status: 500 });
  }
}
