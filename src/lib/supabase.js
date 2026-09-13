import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("VITE_SUPABASE_URL:", url ? "FOUND" : "MISSING");
console.log("VITE_SUPABASE_PUBLISHABLE_KEY:", key ? "FOUND" : "MISSING");

if (!url || !key) {
  throw new Error("Supabase environment variables are missing.");
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});