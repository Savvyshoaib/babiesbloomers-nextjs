import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSession } from "@/lib/session";

/**
 * Handles Auth recovery redirects after the user clicks the SMTP reset link.
 * The email itself is sent via Google SMTP; this route only exchanges the code.
 * Configure in Supabase → Auth → URL Configuration:
 *   Redirect URLs: https://your-domain/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/update-password";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      await createSession(data.user.id, data.user.email);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/sign-in?error=auth_callback_failed`,
  );
}
