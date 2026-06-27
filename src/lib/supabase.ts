import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  if (value.startsWith("PASTE_") || value.startsWith("your_")) {
    throw new Error(`Replace placeholder value for environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}

export function getSupabasePublic() {
  if (!publicClient) {
    publicClient = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
      auth: { persistSession: false },
    });
  }
  return publicClient;
}
