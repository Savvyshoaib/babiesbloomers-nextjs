import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fail, ok } from "@/lib/api-response";

export async function GET() {
  try {
    const supabase = await createClient();

    const { error: profErr } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    const { error: ordErr } = await supabase
      .from("orders")
      .select("id")
      .limit(1);

    const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    const hasSessionSecret = Boolean(process.env.SESSION_SECRET);

    if (profErr || ordErr) {
      return NextResponse.json(
        fail("Database check failed.", profErr?.message ?? ordErr?.message),
        { status: 500 },
      );
    }

    return NextResponse.json(
      ok("Database connection is healthy.", {
        profiles: "ok",
        orders: "ok",
        env: {
          supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          anonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          serviceRoleKey: hasServiceRole,
          sessionSecret: hasSessionSecret,
        },
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(fail("Database check crashed.", message), {
      status: 500,
    });
  }
}
