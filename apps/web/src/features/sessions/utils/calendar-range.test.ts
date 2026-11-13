import { describe, expect, it } from 'vitest';

import { calendarRange, rangeForDay } from './calendar-range';

// Friday, 13 November 2026.
const ANCHOR = new Date(2026, 10, 13);

describe('calendarRange', () => {
  it('spans the whole Monday–Sunday weeks around the month', () => {
    const { from, to } = calendarRange(ANCHOR, 'month');
    expect({ from, to }).toEqual({ from: '2026-10-26', to: '2026-12-06' });
  });

  it('spans the single Monday–Sunday week in week view', () => {
    const { from, to } = calendarRange(ANCHOR, 'week');
    expect({ from, to }).toEqual({ from: '2026-11-09', to: '2026-11-15' });
  });
});

describe('rangeForDay', () => {
  it('reuses the grid window for a day on screen — including bleed-in days', () => {
    expect(rangeForDay('2026-11-20', ANCHOR, 'month')).toMatchObject({
      from: '2026-10-26',
      to: '2026-12-06',
    });
    expect(rangeForDay('2026-12-06', ANCHOR, 'month')).toMatchObject({
      from: '2026-10-26',
      to: '2026-12-06',
    });
  });

  it('falls back to the month grid around a day off screen', () => {
    expect(rangeForDay('2026-12-07', ANCHOR, 'month')).toMatchObject({
      from: '2026-11-30',
      to: '2027-01-03',
    });
  });

  it('uses the week window in week view, the month grid outside it', () => {
    expect(rangeForDay('2026-11-15', ANCHOR, 'week')).toMatchObject({
      from: '2026-11-09',
      to: '2026-11-15',
    });
    expect(rangeForDay('2026-11-16', ANCHOR, 'week')).toMatchObject({
      from: '2026-10-26',
      to: '2026-12-06',
    });
  });
});
