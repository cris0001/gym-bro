import { describe, expect, it } from 'vitest';

import type { Food, RecipeListItem } from '@gym-bro/shared';

import { type AddEntryRow, portionKcal, rowMeta } from './add-entry-list';

const UNITS = { grams: 'g', servings: 'serv', units: 'pcs' } as const;

const food = (over: Partial<Food> = {}): Food => ({
  id: 'f1',
  userId: 'u1',
  globalProductId: null,
  name: 'Banana',
  ean: null,
  brand: null,
  kcal: 89,
  proteinG: 1.1,
  carbsG: 20.2,
  fatG: 0.3,
  servingGrams: 150,
  unitGrams: 120,
  imageUrl: null,
  isActive: true,
  createdAt: '',
  updatedAt: '',
  ...over,
});

const foodRow = (f: Food, lastUsed: AddEntryRow['lastUsed'] = null): AddEntryRow => ({
  kind: 'food',
  id: f.id,
  name: f.name,
  imageUrl: null,
  meta: '',
  isRecent: lastUsed !== null,
  food: f,
  lastUsed,
});

const recipeRow = (): AddEntryRow => ({
  kind: 'recipe',
  id: 'r1',
  name: 'Bowl',
  imageUrl: null,
  meta: '',
  isRecent: false,
  recipe: {
    perServing: { kcal: 400, proteinG: 30, carbsG: 40, fatG: 10 },
    servings: 2,
    totalGrams: 1000,
  } as RecipeListItem,
  lastUsed: null,
});

describe('portionKcal', () => {
  it('scales a food per 100 g by grams, servings and units', () => {
    const row = foodRow(food());
    expect(portionKcal(row, { unit: 'grams', quantity: 200 })).toBeCloseTo(178);
    expect(portionKcal(row, { unit: 'servings', quantity: 2 })).toBeCloseTo(267);
    expect(portionKcal(row, { unit: 'units', quantity: 1 })).toBeCloseTo(106.8);
  });

  it('is null for a unit the food has no weight for', () => {
    const row = foodRow(food({ servingGrams: null }));
    expect(portionKcal(row, { unit: 'servings', quantity: 1 })).toBeNull();
  });

  it('uses per-serving or per-gram kcal for a recipe', () => {
    const row = recipeRow();
    expect(portionKcal(row, { unit: 'servings', quantity: 1.5 })).toBe(600);
    // 800 kcal over 1000 g → 0.8 kcal/g.
    expect(portionKcal(row, { unit: 'grams', quantity: 250 })).toBeCloseTo(200);
  });
});

describe('rowMeta', () => {
  it('describes the last-logged portion, scaled, and flags it', () => {
    const row = foodRow(food(), { unit: 'servings', quantity: 1.4 });
    expect(rowMeta(row, UNITS)).toEqual({
      fromLast: true,
      portion: '1.4 serv',
      kcal: '187 kcal',
      macros: 'P 2.3 · C 42.4 · F 0.6',
    });
  });

  it('falls back to 100 g for a food and 1 serving for a recipe', () => {
    expect(rowMeta(foodRow(food()), UNITS)).toMatchObject({
      fromLast: false,
      portion: '100 g',
      kcal: '89 kcal',
      macros: 'P 1.1 · C 20.2 · F 0.3',
    });
    expect(rowMeta(recipeRow(), UNITS)).toMatchObject({ portion: '1 serv', kcal: '400 kcal' });
  });
});
