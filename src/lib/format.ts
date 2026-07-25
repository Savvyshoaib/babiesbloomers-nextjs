/** Format a PKR amount to match catalogue display: "₨ 2,586.45" */
export function formatPkr(value: number, decimals = 2): string {
  return `₨ ${value.toLocaleString("en-PK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** Compact cart style: "Rs.1,630" */
export function formatPkrCompact(value: number): string {
  return `Rs.${Math.round(value).toLocaleString("en-PK")}`;
}

/** Checkout summary style: "Rs 1,629.75" */
export function formatPkrCheckout(value: number): string {
  return `Rs ${value.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
