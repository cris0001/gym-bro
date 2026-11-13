import { describe, expect, it } from 'vitest';

import { decodeDataUri, isOwnImageRef, toImageRef } from './nutrition.utils';

const ID = '11111111-1111-4111-8111-111111111111';
const PHOTO = 'data:image/webp;base64,UklGRg==';

describe('toImageRef', () => {
  it('turns an uploaded photo into its endpoint URL with a content version', () => {
    expect(toImageRef('foods', ID, PHOTO)).toMatch(
      new RegExp(`^/api/foods/${ID}/image\\?v=[0-9a-f]{10}$`),
    );
  });

  it('keeps the version stable for the same photo and changes it for a new one', () => {
    expect(toImageRef('recipes', ID, PHOTO)).toBe(toImageRef('recipes', ID, PHOTO));
    expect(toImageRef('recipes', ID, PHOTO)).not.toBe(
      toImageRef('recipes', ID, 'data:image/webp;base64,AAAA'),
    );
  });

  it('passes an external URL and null through untouched', () => {
    expect(toImageRef('foods', ID, 'https://images.openfoodfacts.org/x.jpg')).toBe(
      'https://images.openfoodfacts.org/x.jpg',
    );
    expect(toImageRef('foods', ID, null)).toBeNull();
  });
});

describe('isOwnImageRef', () => {
  it("matches only the same row's ref", () => {
    const ref = toImageRef('foods', ID, PHOTO) ?? '';
    expect(isOwnImageRef('foods', ID, ref)).toBe(true);
    expect(isOwnImageRef('recipes', ID, ref)).toBe(false);
    expect(isOwnImageRef('foods', '22222222-2222-4222-8222-222222222222', ref)).toBe(false);
    expect(isOwnImageRef('foods', ID, PHOTO)).toBe(false);
  });
});

describe('decodeDataUri', () => {
  it('returns the content type and bytes of a data-URI', () => {
    const image = decodeDataUri(PHOTO);
    expect(image?.contentType).toBe('image/webp');
    expect(image?.bytes.equals(Buffer.from('UklGRg==', 'base64'))).toBe(true);
  });

  it('rejects anything that is not a base64 data-URI', () => {
    expect(decodeDataUri('https://images.openfoodfacts.org/x.jpg')).toBeNull();
    expect(decodeDataUri('data:image/webp,notbase64')).toBeNull();
  });
});
