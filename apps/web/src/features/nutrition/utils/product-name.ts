// Prefix the brand onto a scanned product's name when it helps identify it — OFF names
// are often terse ("Zero", "Classic"), and the producer makes them recognisable.
// Skips it when the brand is already part of the name, to avoid "Coca-Cola Coca-Cola".
export function scannedFoodName(name: string, brand: string | null): string {
  const n = name.trim();
  const b = brand?.trim();
  if (!b || n.toLowerCase().includes(b.toLowerCase())) return n;
  return `${b} ${n}`;
}
