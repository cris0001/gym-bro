// GS1 "restricted circulation" barcodes: numbers a store assigns internally, mostly to
// items weighed at the counter (deli, bakery, loose produce), often with the weight or
// price encoded in the digits. They aren't unique across stores, and the same item
// gets a new code on every weighing, so they must never key a shared global product.
//
// Ranges (as EAN-13 prefixes): 020–029, 040–049 and 200–299. A 12-digit UPC-A is an
// EAN-13 with a leading 0, so it's normalised first (UPC number systems 2 and 4 map to
// 02x / 04x). An EAN-8 starting with 0 or 2 is the short-code equivalent.
export function isRestrictedBarcode(code: string): boolean {
  if (code.length === 8) {
    return code.startsWith('0') || code.startsWith('2');
  }

  const ean13 = code.length === 12 ? `0${code}` : code;
  if (ean13.length !== 13) return false;

  const prefix = Number(ean13.slice(0, 3));
  return (
    (prefix >= 20 && prefix <= 29) ||
    (prefix >= 40 && prefix <= 49) ||
    (prefix >= 200 && prefix <= 299)
  );
}
