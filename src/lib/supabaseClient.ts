/**
 * @deprecated Use `getSupabaseBrowserClient` from `@/lib/supabase/client` instead.
 *
 * This file is kept for backwards compatibility with Day 6 imports.
 * It re-exports the singleton browser client created by the new module so
 * existing code (login page, etc.) continues to work without changes.
 */
export { getSupabaseBrowserClient as getSupabaseClient } from '@/lib/supabase/client';

// Default export for `import supabase from '@/lib/supabaseClient'` call sites.
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
export default getSupabaseBrowserClient();
