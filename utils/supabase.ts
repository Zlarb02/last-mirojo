import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase URL or ANON_KEY not found in environment variables"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
