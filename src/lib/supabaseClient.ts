/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://iffdkhzctkbglmvaayeh.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_C7DzW73hItwOaxr9R4Z2dw_HtjCqHaS';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[Giriraj Power] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not defined in environment variables. Using embedded fallback configuration.'
  );
}

/**
 * Shared Supabase Client singleton with persistent session handling
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'giriraj_supabase_auth_session'
  }
});

