export function formatKes(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  return `KES ${rounded.toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
