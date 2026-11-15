import { describe, expect, it } from 'vitest';

import type { WorkoutSessionDetail } from '@gym-bro/shared';

import { buildStatsCsv } from './export-csv';
import { buildExportModel } from './export-model';

type SetSpec = [weight: number | null, reps: number | null, isTop?: boolean];

function session(
  date: string,
  perfs: { id: string; name: string; sets: SetSpec[] }[],
  extra: Partial<WorkoutSessionDetail> = {},
): WorkoutSessionDetail {
  return {
    id: `s-${date}`,
    userId: 'u',
    plannedSessionId: null,
    workoutTemplateId: null,
    sessionType: 'strength',
    name: 'Push',
    performedDate: date,
    durationMinutes: 60,
    rating: 4,
    notes: null,
    createdAt: date,
    updatedAt: date,
    tags: [],
    performances: perfs.map((p, i) => {
      const exercise = { id: p.id, name: p.name, category: 'Chest' as const, isActive: true };
      return {
        id: `p-${date}-${i}`,
        workoutSessionId: `s-${date}`,
        userId: 'u',
        originalExerciseId: p.id,
        actualExerciseId: p.id,
        position: i,
        notes: null,
        createdAt: date,
        updatedAt: date,
        exercise,
        originalExercise: exercise,
        sets: p.sets.map(([weight, reps, isTop], j) => ({
          id: `set-${date}-${i}-${j}`,
          exercisePerformanceId: `p-${date}-${i}`,
          userId: 'u',
          position: j,
          weight,
          reps,
          rir: null,
          isTopSet: isTop ?? false,
          createdAt: date,
          updatedAt: date,
        })),
      };
    }),
    ...extra,
  };
}

describe('buildExportModel', () => {
  const sessions = [
    session('2026-11-10', [
      {
        id: 'bench',
        name: 'Bench press',
        sets: [
          [85, 5, true],
          [80, 8],
        ],
      },
      { id: 'pullup', name: 'Pull-up', sets: [[null, 10]] },
    ]),
    session('2026-11-03', [
      {
        id: 'bench',
        name: 'Bench press',
        sets: [
          [80, 6, true],
          [75, 8],
        ],
      },
    ]),
  ];

  it('lists only exercises trained in the sessions, most-trained first', () => {
    const model = buildExportModel(sessions);
    expect(model.exercises.map((e) => e.name)).toEqual(['Bench press', 'Pull-up']);
    expect(model.workouts).toBe(2);
    expect(model.sets).toBe(5);
  });

  it('computes best, change and volume per exercise, oldest point first', () => {
    const bench = buildExportModel(sessions).exercises[0]!;
    expect(bench.best).toEqual({ weight: 85, reps: 5, date: '2026-11-10' });
    expect(bench.change).toBe(5);
    expect(bench.points.map((p) => p.weight)).toEqual([80, 85]);
    expect(bench.volume).toBe(80 * 6 + 75 * 8 + 85 * 5 + 80 * 8);
  });

  it('treats bodyweight-only exercises as having no weights', () => {
    const pullup = buildExportModel(sessions).exercises[1]!;
    expect(pullup.best).toBeNull();
    expect(pullup.change).toBeNull();
    expect(pullup.volume).toBe(0);
    // …but keeps the best reps per session, for the reps chart.
    expect(pullup.points.map((p) => p.reps)).toEqual([10]);
  });

  it('skips activity sessions and empty performances, and keeps the given range', () => {
    const model = buildExportModel(
      [
        ...sessions,
        session('2026-11-05', [], { sessionType: 'activity' }),
        session('2026-11-07', [{ id: 'squat', name: 'Squat', sets: [] }]),
      ],
      { from: '2026-11-01', to: '2026-11-14' },
    );
    expect(model.exercises.map((e) => e.name)).not.toContain('Squat');
    expect(model.workouts).toBe(3);
    expect([model.from, model.to]).toEqual(['2026-11-01', '2026-11-14']);
  });
});

describe('buildStatsCsv', () => {
  it('writes one row per set with a header and quotes cells that need it', () => {
    const model = buildExportModel([
      session('2026-11-10', [{ id: 'row', name: 'Row, barbell', sets: [[70, 8, true]] }]),
    ]);
    const lines = buildStatsCsv(model, {
      date: 'date',
      session: 'workout',
      exercise: 'exercise',
      category: 'category',
      set: 'set',
      weight: 'weight_kg',
      reps: 'reps',
      rir: 'rir',
      topSet: 'top_set',
      volume: 'volume_kg',
    })
      .replace('﻿', '')
      .trim()
      .split('\r\n');
    expect(lines[0]).toBe(
      'date,workout,exercise,category,set,weight_kg,reps,rir,top_set,volume_kg',
    );
    expect(lines[1]).toBe('2026-11-10,Push,"Row, barbell",Chest,1,70,8,,1,560');
  });
});
