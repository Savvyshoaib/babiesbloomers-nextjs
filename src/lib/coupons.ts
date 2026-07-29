export type CouponDiscountType = "percent" | "fixed";

export type CouponRow = {
  id: string;
  code: string;
  description: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_subtotal: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CouponValidationResult =
  | {
      ok: true;
      code: string;
      discountType: CouponDiscountType;
      discountValue: number;
      discountAmount: number;
      description: string;
    }
  | { ok: false; message: string };

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function isCouponCurrentlyValid(
  coupon: Pick<
    CouponRow,
    "active" | "starts_at" | "ends_at" | "max_uses" | "used_count"
  >,
  now = new Date(),
): { valid: boolean; reason?: string } {
  if (!coupon.active) {
    return { valid: false, reason: "This coupon is inactive." };
  }

  if (coupon.starts_at) {
    const start = new Date(coupon.starts_at);
    if (now < start) {
      return { valid: false, reason: "This coupon is not active yet." };
    }
  }

  if (coupon.ends_at) {
    const end = new Date(coupon.ends_at);
    if (now > end) {
      return { valid: false, reason: "This coupon has expired." };
    }
  }

  if (
    coupon.max_uses != null &&
    coupon.used_count >= coupon.max_uses
  ) {
    return { valid: false, reason: "This coupon has reached its usage limit." };
  }

  return { valid: true };
}

export function calculateCouponDiscount(
  discountType: CouponDiscountType,
  discountValue: number,
  subtotal: number,
): number {
  if (subtotal <= 0) return 0;
  if (discountType === "percent") {
    const pct = Math.min(100, Math.max(0, discountValue));
    return Number(((subtotal * pct) / 100).toFixed(2));
  }
  return Number(Math.min(subtotal, Math.max(0, discountValue)).toFixed(2));
}

export function validateCouponAgainstCart(
  coupon: CouponRow,
  subtotal: number,
  now = new Date(),
): CouponValidationResult {
  const status = isCouponCurrentlyValid(coupon, now);
  if (!status.valid) {
    return { ok: false, message: status.reason || "Invalid coupon." };
  }

  const min = Number(coupon.min_subtotal) || 0;
  if (subtotal < min) {
    return {
      ok: false,
      message: `Minimum order of Rs ${min.toFixed(2)} required for this coupon.`,
    };
  }

  const discountAmount = calculateCouponDiscount(
    coupon.discount_type,
    Number(coupon.discount_value),
    subtotal,
  );

  if (discountAmount <= 0) {
    return { ok: false, message: "This coupon cannot be applied." };
  }

  return {
    ok: true,
    code: coupon.code,
    discountType: coupon.discount_type,
    discountValue: Number(coupon.discount_value),
    discountAmount,
    description: coupon.description || "",
  };
}
