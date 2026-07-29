export type ShippingMode = "fixed" | "free" | "disabled";

export type CheckoutPaymentType =
  | "cod"
  | "payfast"
  | "bank_transfer"
  | "custom";

export type CheckoutPaymentMethod = {
  id: string;
  type: CheckoutPaymentType;
  label: string;
  description: string;
  enabled: boolean;
  bankDetails: string;
};

export type CheckoutCustomSection = {
  id: string;
  title: string;
  body: string;
  enabled: boolean;
};

export type CheckoutShippingSettings = {
  enabled: boolean;
  mode: ShippingMode;
  fee: number;
  label: string;
};

export type CheckoutSettings = {
  shipping: CheckoutShippingSettings;
  payments: CheckoutPaymentMethod[];
  customSections: CheckoutCustomSection[];
};

export const DEFAULT_CHECKOUT_SETTINGS: CheckoutSettings = {
  shipping: {
    enabled: true,
    mode: "fixed",
    fee: 200,
    label: "Standard Shipping",
  },
  payments: [
    {
      id: "cod",
      type: "cod",
      label: "Cash on Delivery (COD)",
      description: "Pay with cash when your order arrives.",
      enabled: true,
      bankDetails: "",
    },
    {
      id: "payfast",
      type: "payfast",
      label: "PAYFAST (Debit / Credit / Wallet / Bank)",
      description: "You will be redirected to PAYFAST to complete payment.",
      enabled: true,
      bankDetails: "",
    },
    {
      id: "bank_transfer",
      type: "bank_transfer",
      label: "Bank Transfer",
      description: "Transfer the total to our bank account and share the receipt.",
      enabled: false,
      bankDetails:
        "Bank: HBL\nAccount Title: Babies Bloomers\nAccount No: 0000-0000000-00\nIBAN: PK00HABB0000000000000000",
    },
  ],
  customSections: [],
};

function asMode(value: unknown): ShippingMode {
  if (value === "free" || value === "disabled" || value === "fixed") return value;
  return "fixed";
}

function asPaymentType(value: unknown): CheckoutPaymentType {
  if (
    value === "cod" ||
    value === "payfast" ||
    value === "bank_transfer" ||
    value === "custom"
  ) {
    return value;
  }
  return "custom";
}

export function mergeCheckoutSettings(
  raw: unknown,
): CheckoutSettings {
  const partial =
    raw && typeof raw === "object" ? (raw as Partial<CheckoutSettings>) : {};
  const shippingPartial =
    partial.shipping && typeof partial.shipping === "object"
      ? partial.shipping
      : {};

  const fee = Number(
    (shippingPartial as CheckoutShippingSettings).fee ??
      DEFAULT_CHECKOUT_SETTINGS.shipping.fee,
  );

  const paymentsRaw = Array.isArray(partial.payments)
    ? partial.payments
    : DEFAULT_CHECKOUT_SETTINGS.payments;

  const payments: CheckoutPaymentMethod[] = paymentsRaw
    .map((row, index) => {
      const r = row as Partial<CheckoutPaymentMethod>;
      const type = asPaymentType(r.type);
      const id =
        String(r.id ?? "").trim() ||
        `${type}-${index}-${Math.random().toString(36).slice(2, 6)}`;
      return {
        id,
        type,
        label: String(r.label ?? type).trim() || type,
        description: String(r.description ?? "").trim(),
        enabled: Boolean(r.enabled ?? true),
        bankDetails: String(r.bankDetails ?? ""),
      };
    })
    .slice(0, 12);

  const sectionsRaw = Array.isArray(partial.customSections)
    ? partial.customSections
    : [];

  const customSections: CheckoutCustomSection[] = sectionsRaw
    .map((row, index) => {
      const r = row as Partial<CheckoutCustomSection>;
      return {
        id:
          String(r.id ?? "").trim() ||
          `section-${index}-${Math.random().toString(36).slice(2, 6)}`,
        title: String(r.title ?? "").trim(),
        body: String(r.body ?? "").trim(),
        enabled: Boolean(r.enabled ?? true),
      };
    })
    .filter((s) => s.title || s.body)
    .slice(0, 8);

  return {
    shipping: {
      enabled: Boolean(
        (shippingPartial as CheckoutShippingSettings).enabled ??
          DEFAULT_CHECKOUT_SETTINGS.shipping.enabled,
      ),
      mode: asMode((shippingPartial as CheckoutShippingSettings).mode),
      fee: Number.isFinite(fee) && fee >= 0 ? fee : 0,
      label:
        String(
          (shippingPartial as CheckoutShippingSettings).label ??
            DEFAULT_CHECKOUT_SETTINGS.shipping.label,
        ).trim() || "Shipping",
    },
    payments:
      payments.length > 0 ? payments : DEFAULT_CHECKOUT_SETTINGS.payments,
    customSections,
  };
}

/** Resolve shipping fee for a non-empty cart from admin settings. */
export function resolveShippingFee(settings: CheckoutSettings): number {
  const { shipping } = settings;
  if (!shipping.enabled || shipping.mode === "disabled" || shipping.mode === "free") {
    return 0;
  }
  return Math.max(0, Number(shipping.fee) || 0);
}

export function enabledPaymentMethods(
  settings: CheckoutSettings,
): CheckoutPaymentMethod[] {
  return settings.payments.filter((p) => p.enabled);
}
