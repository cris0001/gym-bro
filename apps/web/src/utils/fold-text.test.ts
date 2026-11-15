import { describe, expect, it } from 'vitest';

import { foldText, matchesQuery } from './fold-text';

describe('foldText', () => {
  it('removes Polish diacritics and lower-cases', () => {
    expect(foldText('Ryż biały')).toBe('ryz bialy');
    expect(foldText('Żółtko jaja')).toBe('zoltko jaja');
    expect(foldText('ŁOSOŚ Wędzony')).toBe('losos wedzony');
    expect(foldText('Ćwiczenie źródło ńąę')).toBe('cwiczenie zrodlo nae');
  });

  it('leaves plain text unchanged apart from case', () => {
    expect(foldText('Bench Press 3x8')).toBe('bench press 3x8');
  });
});

describe('matchesQuery', () => {
  it('matches regardless of accents on either side', () => {
    expect(matchesQuery('Ryż biały (ugotowany)', foldText('ryz bialy'))).toBe(true);
    expect(matchesQuery('Ryż biały (ugotowany)', foldText('ryż'))).toBe(true);
    expect(matchesQuery('Łosoś', foldText('losos'))).toBe(true);
  });

  it('does not match unrelated names', () => {
    expect(matchesQuery('Kasza gryczana', foldText('ryz'))).toBe(false);
  });
});
