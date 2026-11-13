import { describe, expect, it } from 'vitest';

import { isRestrictedBarcode } from './barcode';

describe('isRestrictedBarcode', () => {
  it('accepts regular product barcodes', () => {
    expect(isRestrictedBarcode('5900531004049')).toBe(false); // Polish (590)
    expect(isRestrictedBarcode('4056489216230')).toBe(false); // German / Lidl (405)
    expect(isRestrictedBarcode('5000159376655')).toBe(false); // UK (500)
  });

  it('rejects in-store EAN-13 codes (200–299)', () => {
    expect(isRestrictedBarcode('2000000000008')).toBe(true);
    expect(isRestrictedBarcode('2912345012345')).toBe(true);
  });

  it('rejects the 020–029 and 040–049 EAN-13 ranges', () => {
    expect(isRestrictedBarcode('0212345678901')).toBe(true);
    expect(isRestrictedBarcode('0412345678901')).toBe(true);
    expect(isRestrictedBarcode('0312345678901')).toBe(false);
  });

  it('normalises UPC-A, rejecting number systems 2 and 4', () => {
    expect(isRestrictedBarcode('212345678901')).toBe(true);
    expect(isRestrictedBarcode('412345678901')).toBe(true);
    expect(isRestrictedBarcode('012345678905')).toBe(false);
  });

  it('rejects EAN-8 codes starting with 0 or 2', () => {
    expect(isRestrictedBarcode('01234565')).toBe(true);
    expect(isRestrictedBarcode('21234567')).toBe(true);
    expect(isRestrictedBarcode('59012341')).toBe(false);
  });

  it('accepts GTIN-14 case codes', () => {
    expect(isRestrictedBarcode('25900531004046')).toBe(false);
  });
});
