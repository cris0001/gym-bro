import { describe, expect, it } from 'vitest';

import { divideMacros, multiplyMacros, scaleMacros, sumMacros } from './nutrition.utils';

const CHICKEN = { kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 };

describe('scaleMacros', () => {
  it('scales per-100g macros to a gram amount', () => {
    expect(scaleMacros(CHICKEN, 200)).toEqual({ kcal: 330, proteinG: 62, carbsG: 0, fatG: 7.2 });
  });

  it('is the identity at 100g', () => {
    expect(scaleMacros(CHICKEN, 100)).toEqual(CHICKEN);
  });

  it('scales below 100g', () => {
    expect(scaleMacros(CHICKEN, 50)).toEqual({ kcal: 82.5, proteinG: 15.5, carbsG: 0, fatG: 1.8 });
  });
});

describe('sumMacros', () => {
  it('sums a list of macro totals', () => {
    expect(
      sumMacros([
        { kcal: 100, proteinG: 10, carbsG: 5, fatG: 2 },
        { kcal: 50, proteinG: 4, carbsG: 8, fatG: 1 },
      ]),
    ).toEqual({ kcal: 150, proteinG: 14, carbsG: 13, fatG: 3 });
  });

  it('returns zeros for an empty list', () => {
    expect(sumMacros([])).toEqual({ kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  });
});

describe('divideMacros', () => {
  it('divides totals by a serving count', () => {
    expect(divideMacros({ kcal: 800, proteinG: 60, carbsG: 40, fatG: 20 }, 4)).toEqual({
      kcal: 200,
      proteinG: 15,
      carbsG: 10,
      fatG: 5,
    });
  });
});

describe('multiplyMacros', () => {
  it('multiplies totals by a factor (e.g. per-serving x servings logged)', () => {
    expect(multiplyMacros({ kcal: 200, proteinG: 15, carbsG: 10, fatG: 5 }, 1.5)).toEqual({
      kcal: 300,
      proteinG: 22.5,
      carbsG: 15,
      fatG: 7.5,
    });
  });
});
