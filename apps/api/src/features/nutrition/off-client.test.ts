import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchOffProduct } from './off-client';

// off-client is the HTTP boundary to OpenFoodFacts; mock global fetch and pin the
// parsing/mapping of a sparse, inconsistent payload.
const OFF_EAN = '5902180202333';

function mockFetch(json: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok, json: () => Promise.resolve(json) } as unknown as Response)),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchOffProduct', () => {
  it('maps macros per 100g, the first brand, serving and image from an OFF product', async () => {
    mockFetch({
      status: 1,
      product: {
        product_name: 'Cola',
        brands: 'Coca-Cola, The Coca-Cola Company',
        serving_quantity: '250',
        image_front_small_url: 'https://img/cola.jpg',
        nutriments: {
          'energy-kcal_100g': 42,
          proteins_100g: 0,
          carbohydrates_100g: 10.6,
          fat_100g: 0,
        },
      },
    });

    const off = await fetchOffProduct(OFF_EAN);
    expect(off).toMatchObject({
      ean: OFF_EAN,
      name: 'Cola',
      brand: 'Coca-Cola',
      kcal: 42,
      carbsG: 10.6,
      servingGrams: 250,
      imageUrl: 'https://img/cola.jpg',
    });
  });

  it('returns null when the product is not found (status 0)', async () => {
    mockFetch({ status: 0 });
    expect(await fetchOffProduct(OFF_EAN)).toBeNull();
  });

  it('returns null on a non-ok response', async () => {
    mockFetch({}, false);
    expect(await fetchOffProduct(OFF_EAN)).toBeNull();
  });

  it('keeps the product but nulls missing macros', async () => {
    mockFetch({ status: 1, product: { product_name: 'Mystery' } });
    const off = await fetchOffProduct(OFF_EAN);
    expect(off).toMatchObject({ name: 'Mystery', kcal: null, proteinG: null, brand: null });
  });
});
