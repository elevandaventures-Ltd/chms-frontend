import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (typeof window !== 'undefined' && url && anonKey) {
  supabase = createClient(url, anonKey);
}

export function getSupabaseClient() {
  return supabase;
}

export default supabase;
