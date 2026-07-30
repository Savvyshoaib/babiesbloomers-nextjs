"use client";

import { createClient } from "@/lib/supabase/client";
import { signOut as signOutAction } from "@/app/actions/auth";

/**
 * Signs the browser Supabase client out first so its onAuthStateChange
 * listener fires SIGNED_OUT immediately (updates this tab's Redux auth
 * state right away, and syncs other open tabs via Supabase's storage
 * event), then clears the server session cookie and redirects.
 */
export async function performClientSignOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  await signOutAction();
}
