import { describe, expect, it } from 'vitest';

import type { Food, GlobalProduct } from '@gym-bro/shared';

import { buildAddEntryList, catalogRow, defaultPortion } from './add-entry-list';
import { catalogFoodName } from './product-name';

function product(overrides: Partial<GlobalProduct> = {}): GlobalProduct {
  return {
    id: 'g-banana',
    ean: null,
    name: 'Banana',
    namePl: 'Banan',
    nameEn: 'Banana',
    brand: null,
    kcal: 89,
    proteinG: 1.1,
    carbsG: 22.8,
    fatG: 0.3,
    servingGrams: null,
    unitGrams: 120,
    imageUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function food(overrides: Partial<Food> = {}): Food {
  return {
    id: 'f-1',
    userId: 'u1',
    globalProductId: null,
    name: 'Banan dojrzały',
    ean: null,
    brand: null,
    kcal: 95,
    proteinG: 1,
    carbsG: 23,
    fatG: 0.3,
    servingGrams: null,
    unitGrams: null,
    imageUrl: null,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('catalogFoodName', () => {
  it('names a generic food in the UI language', () => {
    expect(catalogFoodName(product(), 'pl')).toBe('Banan');
    expect(catalogFoodName(product(), 'en')).toBe('Banana');
  });

  it('names a packaged product by its name with the brand', () => {
    const yogurt = product({ ean: '5900531004049', name: 'Skyr', brand: 'Piątnica' });
    expect(catalogFoodName(yogurt, 'en')).toBe('Piątnica Skyr');
  });
});

describe('buildAddEntryList with catalog rows', () => {
  const catalog = [catalogRow(product(), 'Banan')];

  it('lists catalog matches after your own matches while typing', () => {
    const rows = buildAddEntryList([food()], [], [], 'banan', catalog);
    expect(rows.map((r) => r.kind)).toEqual(['food', 'catalog']);
  });

  it('hides a catalog product you already have a copy of', () => {
    const copy = food({ globalProductId: 'g-banana' });
    const rows = buildAddEntryList([copy], [], [], 'banan', catalog);
    expect(rows.map((r) => r.kind)).toEqual(['food']);
  });

  it('shows no catalog rows when not searching', () => {
    const rows = buildAddEntryList([food()], [], [], '', catalog);
    expect(rows.every((r) => r.kind !== 'catalog')).toBe(true);
  });
});

describe('defaultPortion for a catalog row', () => {
  it('uses 100 g without a serving size', () => {
    expect(defaultPortion(catalogRow(product(), 'Banan'))).toEqual({
      unit: 'grams',
      quantity: 100,
    });
  });

  it('uses one serving when the product has one', () => {
    const row = catalogRow(product({ servingGrams: 150 }), 'Banan');
    expect(defaultPortion(row)).toEqual({ unit: 'servings', quantity: 1 });
  });
});
