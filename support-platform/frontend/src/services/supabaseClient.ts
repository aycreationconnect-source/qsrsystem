import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vhowowbxyqztakovrqwy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

if (supabaseAnonKey && supabaseAnonKey !== 'your-anon-key-here') {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
    });
    console.log(`[Supabase] Browser client initialized for project ${supabaseUrl}`);
  } catch (err) {
    console.warn('[Supabase] Failed to initialize Supabase client:', err);
  }
} else {
  console.info(
    '[Supabase] VITE_SUPABASE_ANON_KEY not set or placeholder. Frontend will route queries through NestJS backend API.',
  );
}

export const supabase = client;
