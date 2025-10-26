interface iAppProps {
  amount: number;
  currency: "CAD" | "USD" | "EUR";
}

export function formatCurrency({ amount, currency }: iAppProps) {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: currency,
  }).format(amount);
}
