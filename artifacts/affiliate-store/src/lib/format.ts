export function formatPrice(price: number, currency?: string | null): string {
  const curr = currency?.toUpperCase() || "INR";

  if (curr === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: curr,
    maximumFractionDigits: 2,
  }).format(price);
}
