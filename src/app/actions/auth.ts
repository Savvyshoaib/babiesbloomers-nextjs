"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { fail, ok, type ApiResponse } from "@/lib/api-response";
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "@/lib/email";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function recoveryRedirect() {
  return `${siteUrl()}/auth/callback?next=/update-password`;
}

function generateTempPassword() {
  const chunk = () => Math.random().toString(36).slice(2, 6);
  return `Bb${chunk()}${chunk().toUpperCase()}!${Math.floor(10 + Math.random() * 89)}`;
}

async function findUserIdByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<string | null> {
  const { data: rpcId } = await admin.rpc("get_auth_user_id_by_email", {
    p_email: email,
  });
  if (rpcId) return rpcId as string;

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (profile?.id) return profile.id as string;

  // Last resort: scan auth users (first page is enough for most shops)
  const { data: listed } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const match = listed?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  return match?.id ?? null;
}

// ─────────────────────────────────────────────────────────────
// Sign Up
// ─────────────────────────────────────────────────────────────
export async function signUp(
  _prevState: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  if (!email || !password || !firstName || !lastName) {
    return fail("All fields are required.");
  }
  if (password.length < 8) {
    return fail("Password must be at least 8 characters.");
  }

  // Create via service role so Supabase does not send its own auth emails.
  // Welcome mail goes out through our SMTP.
  const admin = createAdminClient();
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `${firstName} ${lastName}` },
  });

  if (error || !created.user) {
    const msg = (error?.message ?? "").toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("already been registered") ||
      msg.includes("already exists") ||
      msg.includes("user already") ||
      error?.status === 422
    ) {
      return fail(
        "An account with this email already exists. Please sign in.",
      );
    }
    return fail(error?.message ?? "Something went wrong. Please try again.");
  }

  await admin.from("profiles").upsert({
    id: created.user.id,
    first_name: firstName,
    last_name: lastName,
    email,
    role: "customer",
  });

  const welcome = await sendWelcomeEmail({ to: email, firstName });
  if (!welcome.ok) {
    console.error("[auth] welcome email failed:", welcome.error);
  }

  await createSession(created.user.id, email);
  redirect("/account");
}

// ─────────────────────────────────────────────────────────────
// Sign In
// ─────────────────────────────────────────────────────────────
export async function signIn(
  _prevState: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "").trim();

  if (!email || !password) {
    return fail("Email and password are required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return fail("Invalid email or password. Please try again.");
  }

  await createSession(data.user.id, email);

  // Route admins to admin panel when appropriate
  let destination = "/account";
  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    destination = redirectTo;
  } else {
    try {
      const admin = createAdminClient();
      const bootstrap = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
      if (bootstrap && email === bootstrap) {
        await admin
          .from("profiles")
          .update({ role: "admin", email })
          .eq("id", data.user.id);
        destination = "/admin";
      } else {
        const { data: profile } = await admin
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile?.role === "admin" || profile?.role === "shop_manager") {
          destination = "/admin";
        }
      }
    } catch {
      // keep /account
    }
  }

  redirect(destination);
}

// ─────────────────────────────────────────────────────────────
// Forgot password
// ─────────────────────────────────────────────────────────────
export async function requestPasswordReset(
  _prevState: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return fail("Please enter your email address.");

  const genericOk =
    "If an account exists for this email, a password reset link has been sent.";

  try {
    const admin = createAdminClient();
    // Generate recovery link without sending Supabase's built-in email.
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: recoveryRedirect(),
      },
    });

    if (error || !data?.properties?.action_link) {
      // Do not reveal whether the email exists.
      console.error("[auth] reset link generate failed:", error?.message);
      return ok(genericOk);
    }

    const mail = await sendPasswordResetEmail({
      to: email,
      resetUrl: data.properties.action_link,
    });

    if (!mail.ok) {
      console.error("[auth] reset SMTP failed:", mail.error);
      return fail(
        "Could not send reset email right now. Please try again shortly.",
        mail.error,
      );
    }

    return ok(genericOk);
  } catch (err) {
    console.error("[auth] reset password error:", err);
    return ok(genericOk);
  }
}

// ─────────────────────────────────────────────────────────────
// Update password (after recovery link)
// ─────────────────────────────────────────────────────────────
export async function updatePassword(
  _prevState: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!password || password.length < 8) {
    return fail("Password must be at least 8 characters.");
  }
  if (password !== confirm) {
    return fail("Passwords do not match.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return fail(
      "Could not update password. Please request a new reset link.",
      error.message,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    await createSession(user.id, user.email);
  }

  redirect("/account");
}

// ─────────────────────────────────────────────────────────────
// Sign Out
// ─────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await deleteSession();
  redirect("/");
}

// ─────────────────────────────────────────────────────────────
// Get current user profile (server)
// ─────────────────────────────────────────────────────────────
export async function getCurrentUserProfile() {
  const session = await getSession();
  if (!session) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.userId)
    .single();

  return data;
}

// ─────────────────────────────────────────────────────────────
// Update profile
// ─────────────────────────────────────────────────────────────
export async function updateProfile(
  _prevState: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const session = await getSession();
  if (!session) return fail("Not authenticated. Please sign in again.");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!firstName || !lastName) {
    return fail("First name and last name are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone,
    })
    .eq("id", session.userId);

  if (error) return fail("Could not update profile.", error.message);

  revalidatePath("/account/settings");
  return ok("Profile updated successfully.");
}

// ─────────────────────────────────────────────────────────────
// Upsert address (shipping or billing)
// ─────────────────────────────────────────────────────────────
export async function upsertAddress(
  _prevState: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const session = await getSession();
  if (!session) return fail("Not authenticated. Please sign in again.");

  const type = String(formData.get("type") ?? "shipping") as
    | "shipping"
    | "billing";

  if (type !== "shipping" && type !== "billing") {
    return fail("Invalid address type.");
  }

  const addressData = {
    user_id: session.userId,
    type,
    first_name: String(formData.get("firstName") ?? "").trim(),
    last_name: String(formData.get("lastName") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    postal_code: String(formData.get("postal") ?? "").trim(),
    country: String(formData.get("country") ?? "Pakistan").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
  };

  if (
    !addressData.first_name ||
    !addressData.last_name ||
    !addressData.address ||
    !addressData.city ||
    !addressData.phone
  ) {
    return fail("Please fill in all required address fields.");
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("addresses")
    .select("id")
    .eq("user_id", session.userId)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("addresses")
      .update(addressData)
      .eq("id", existing.id);
    if (error) {
      return fail(`Could not save ${type} address.`, error.message);
    }
  } else {
    const { error } = await supabase.from("addresses").insert(addressData);
    if (error) {
      return fail(`Could not save ${type} address.`, error.message);
    }
  }

  revalidatePath("/account/settings");
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return ok(`${label} address saved successfully.`);
}

// ─────────────────────────────────────────────────────────────
// Create or get user by email (guest checkout)
// One email = one account. Existing users are never re-created.
// Returns temporaryPassword only when a NEW account is created.
// ─────────────────────────────────────────────────────────────
export async function createOrGetUserByEmail(
  email: string,
  firstName: string,
  lastName: string,
): Promise<
  ApiResponse<{ userId: string; isNew: boolean; temporaryPassword?: string }>
> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return fail("Email is required to place an order.");
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return fail(
      "Server configuration error. Please contact support.",
      "Missing SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  const existingId = await findUserIdByEmail(admin, normalizedEmail);
  if (existingId) {
    return ok("Existing account found.", {
      userId: existingId,
      isNew: false,
    });
  }

  const temporaryPassword = generateTempPassword();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: normalizedEmail,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { full_name: `${firstName} ${lastName}`.trim() },
    });

  if (createError) {
    const msg = createError.message.toLowerCase();
    const alreadyExists =
      msg.includes("already") ||
      msg.includes("registered") ||
      msg.includes("exists") ||
      createError.status === 422;

    if (alreadyExists) {
      const again = await findUserIdByEmail(admin, normalizedEmail);
      if (again) {
        return ok("Existing account found.", {
          userId: again,
          isNew: false,
        });
      }
    }

    return fail(
      "Could not create your account. Please try again or sign up manually.",
      createError.message,
    );
  }

  if (!created.user) {
    return fail("Could not create your account. Please try again.");
  }

  await admin.from("profiles").upsert({
    id: created.user.id,
    first_name: firstName,
    last_name: lastName,
    email: normalizedEmail,
  });

  return ok("Account created successfully.", {
    userId: created.user.id,
    isNew: true,
    temporaryPassword,
  });
}

// ─────────────────────────────────────────────────────────────
// Change password (logged-in settings)
// ─────────────────────────────────────────────────────────────
export async function changePassword(
  _prevState: ApiResponse | undefined,
  formData: FormData,
): Promise<ApiResponse> {
  const session = await getSession();
  if (!session) return fail("Not authenticated. Please sign in again.");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return fail("Please fill in all password fields.");
  }
  if (newPassword.length < 8) {
    return fail("New password must be at least 8 characters.");
  }
  if (newPassword !== confirmPassword) {
    return fail("New password and confirm password do not match.");
  }
  if (currentPassword === newPassword) {
    return fail("New password must be different from your current password.");
  }

  const supabase = await createClient();

  // Verify current password
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: session.email,
    password: currentPassword,
  });

  if (verifyError) {
    return fail("Current password is incorrect.");
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return fail("Could not update password. Please try again.", error.message);
  }

  return ok("Password changed successfully.");
}

// ─────────────────────────────────────────────────────────────
// Checkout prefill (saved shipping + profile)
// ─────────────────────────────────────────────────────────────
export type CheckoutPrefill = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postal: string;
  country: string;
  phone: string;
  email: string;
};

export async function getCheckoutPrefill(): Promise<CheckoutPrefill | null> {
  const session = await getSession();
  if (!session) return null;

  const supabase = await createClient();

  const [{ data: profile }, { data: shipping }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name, phone, email")
      .eq("id", session.userId)
      .maybeSingle(),
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", session.userId)
      .eq("type", "shipping")
      .maybeSingle(),
  ]);

  return {
    firstName: shipping?.first_name || profile?.first_name || "",
    lastName: shipping?.last_name || profile?.last_name || "",
    address: shipping?.address || "",
    city: shipping?.city || "",
    postal: shipping?.postal_code || "",
    country: shipping?.country || "Pakistan",
    phone: shipping?.phone || profile?.phone || "",
    email: session.email || profile?.email || "",
  };
}

// ─────────────────────────────────────────────────────────────
// Get user addresses
// ─────────────────────────────────────────────────────────────
export async function getUserAddresses() {
  const session = await getSession();
  if (!session) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", session.userId);

  return data ?? [];
}
