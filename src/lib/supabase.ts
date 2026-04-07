import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Use a valid placeholder URL when env vars aren't configured yet
const isConfigured = rawUrl.startsWith("http");
const supabaseUrl = isConfigured ? rawUrl : "https://placeholder.supabase.co";
const supabaseAnonKey = isConfigured ? rawAnonKey : "placeholder";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export function getServiceClient(): SupabaseClient {
  const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const serviceKey = rawServiceKey.startsWith("ey") ? rawServiceKey : "placeholder";
  return createClient(supabaseUrl, serviceKey);
}
