export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const date = (d: string | null | undefined) => {
  if (!d) return "—";
  const x = new Date(d);
  return `${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`;
};

export const classLabel = (c: { name: string; section: string } | null | undefined) => (c ? `${c.name} – ${c.section}` : "Unassigned");

export const PAYMENT_METHODS: Record<string, string> = { CASH: "Cash", UPI: "UPI", CARD: "Card", BANK_TRANSFER: "Bank transfer", CHEQUE: "Cheque" };
