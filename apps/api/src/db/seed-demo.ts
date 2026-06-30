import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';

import { hashPassword } from '../lib/password';
import { db } from './client';
import { bodyMeasurements } from './schema/body-measurements';
import { exercisePerformances } from './schema/exercise-performances';
import { exercises } from './schema/exercises';
import { foodLog } from './schema/food-log';
import { foods } from './schema/foods';
import { nutritionTargets } from './schema/nutrition-targets';
import { plannedSessions } from './schema/planned-sessions';
import { recipeIngredients } from './schema/recipe-ingredients';
import { recipes } from './schema/recipes';
import { sets } from './schema/sets';
import { trainingPlans } from './schema/training-plans';
import { users } from './schema/users';
import { workoutSessions } from './schema/workout-sessions';
import { workoutSessionTags } from './schema/workout-session-tags';
import { workoutTags } from './schema/workout-tags';
import { workoutTemplateExercises } from './schema/workout-template-exercises';
import { workoutTemplates } from './schema/workout-templates';

// One-off demo-account seeder: a realistic, single-user account with ~2 months of
// training, body, and nutrition history. Re-runnable — it deletes the demo user
// first (cascades remove all its data). Run with:
//   pnpm --filter @gym-bro/api exec tsx --env-file=.env src/db/seed-demo.ts

const DEMO_EMAIL = 'demo@gymbro.app';
const DEMO_PASSWORD = 'demo1234';
const HISTORY_DAYS = 63; // ~9 weeks
const DIARY_DAYS = 35;

// --- small helpers ---
const today = new Date();
today.setHours(12, 0, 0, 0);
const iso = (d: Date): string => d.toISOString().slice(0, 10);
const dayOffset = (n: number): Date => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
};
const round = (x: number, step = 0.5): number => Math.round(x / step) * step;
const jitter = (x: number, pct = 0.08): number => x * (1 + (Math.random() * 2 - 1) * pct);
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const num = (x: number): string => x.toFixed(2);

// --- exercise dictionary ---
interface ExSpec {
  cat: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps' | 'Triceps';
  top?: number;
  back?: number;
  tr: number; // top reps
  br: number; // back-off reps
  inc: number; // kg added per week
  noTop?: boolean; // no marked top set (e.g. isolation)
  bw?: boolean; // bodyweight (null weight)
}

const EX: Record<string, ExSpec> = {
  'Bench Press': { cat: 'Chest', top: 92.5, back: 75, tr: 4, br: 8, inc: 1.25 },
  'Overhead Press': { cat: 'Shoulders', top: 55, back: 45, tr: 5, br: 8, inc: 0.5 },
  'Incline Dumbbell Press': { cat: 'Chest', top: 32, back: 26, tr: 6, br: 10, inc: 0.5 },
  'Lateral Raise': { cat: 'Shoulders', top: 14, back: 10, tr: 12, br: 16, inc: 0.5, noTop: true },
  'Triceps Pushdown': { cat: 'Triceps', top: 32, back: 25, tr: 10, br: 14, inc: 0.5 },
  Deadlift: { cat: 'Back', top: 150, back: 120, tr: 3, br: 6, inc: 2.5 },
  'Barbell Row': { cat: 'Back', top: 85, back: 70, tr: 6, br: 10, inc: 1.25 },
  'Pull-up': { cat: 'Back', tr: 9, br: 7, inc: 0, bw: true },
  'Barbell Curl': { cat: 'Biceps', top: 40, back: 32, tr: 8, br: 12, inc: 0.5 },
  Squat: { cat: 'Legs', top: 122.5, back: 100, tr: 4, br: 8, inc: 2.5 },
  'Romanian Deadlift': { cat: 'Legs', top: 100, back: 85, tr: 6, br: 10, inc: 1.25 },
  'Leg Press': { cat: 'Legs', top: 200, back: 170, tr: 8, br: 12, inc: 2.5 },
};

const TEMPLATES: Record<string, string[]> = {
  Push: [
    'Bench Press',
    'Overhead Press',
    'Incline Dumbbell Press',
    'Lateral Raise',
    'Triceps Pushdown',
  ],
  Pull: ['Deadlift', 'Barbell Row', 'Pull-up', 'Barbell Curl'],
  Legs: ['Squat', 'Romanian Deadlift', 'Leg Press'],
};

// Weekday → template (Mon/Wed/Fri/Sat split).
const DAY_TEMPLATE: Record<number, string> = { 1: 'Push', 3: 'Pull', 5: 'Legs', 6: 'Push' };

// --- foods (per 100g: kcal, protein, carbs, fat) ---
const FOODS: [string, number, number, number, number][] = [
  ['Chicken breast', 165, 31, 0, 3.6],
  ['White rice (cooked)', 130, 2.7, 28, 0.3],
  ['Rolled oats', 379, 13, 67, 7],
  ['Banana', 89, 1.1, 23, 0.3],
  ['Whole egg', 143, 13, 1.1, 9.5],
  ['Greek yogurt 2%', 73, 10, 4, 2],
  ['Olive oil', 884, 0, 0, 100],
  ['Almonds', 579, 21, 22, 50],
  ['Whey protein', 400, 80, 8, 6],
  ['Broccoli', 34, 2.8, 7, 0.4],
  ['Salmon fillet', 208, 20, 0, 13],
  ['Sweet potato', 86, 1.6, 20, 0.1],
];

interface Macro {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
const scaleFood = (name: string, grams: number): Macro => {
  const f = FOODS.find((x) => x[0] === name)!;
  const k = grams / 100;
  return { kcal: f[1] * k, proteinG: f[2] * k, carbsG: f[3] * k, fatG: f[4] * k };
};
const sumMacro = (parts: Macro[]): Macro =>
  parts.reduce(
    (a, p) => ({
      kcal: a.kcal + p.kcal,
      proteinG: a.proteinG + p.proteinG,
      carbsG: a.carbsG + p.carbsG,
      fatG: a.fatG + p.fatG,
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );

async function seed(): Promise<void> {
  console.log('Seeding demo account…');

  // Idempotent: drop the demo user (cascades remove everything it owns).
  await db.delete(users).where(eq(users.email, DEMO_EMAIL));

  const userId = randomUUID();
  await db.insert(users).values({
    id: userId,
    email: DEMO_EMAIL,
    passwordHash: await hashPassword(DEMO_PASSWORD),
    birthdate: '1994-03-12',
    sex: 'male',
    heightCm: 181,
    onboardedAt: new Date(),
  });

  // Exercises
  const exIds = new Map<string, string>();
  await db.insert(exercises).values(
    Object.entries(EX).map(([name, spec]) => {
      const id = randomUUID();
      exIds.set(name, id);
      return { id, userId, name, category: spec.cat };
    }),
  );

  // Plan + templates + template exercises
  const planId = randomUUID();
  await db.insert(trainingPlans).values({
    id: planId,
    userId,
    name: 'Push Pull Legs',
    description: 'Main 4-day PPL split.',
  });
  await db.update(users).set({ activePlanId: planId }).where(eq(users.id, userId));

  const templateIds = new Map<string, string>();
  await db.insert(workoutTemplates).values(
    Object.keys(TEMPLATES).map((name, i) => {
      const id = randomUUID();
      templateIds.set(name, id);
      return { id, userId, trainingPlanId: planId, name, position: i };
    }),
  );
  await db.insert(workoutTemplateExercises).values(
    Object.entries(TEMPLATES).flatMap(([tName, list]) =>
      list.map((exName, i) => ({
        id: randomUUID(),
        userId,
        workoutTemplateId: templateIds.get(tName)!,
        exerciseId: exIds.get(exName)!,
        targetSets: 4,
        targetRepsMin: EX[exName]!.br - 2,
        targetRepsMax: EX[exName]!.br + 2,
        position: i,
      })),
    ),
  );

  // Tags
  const TAG_DEFS: [string, string][] = [
    ['PR', '#22c55e'],
    ['Tough', '#ef4444'],
    ['Deload', '#f59e0b'],
  ];
  const tagIds = new Map<string, string>();
  await db.insert(workoutTags).values(
    TAG_DEFS.map(([name, color]) => {
      const id = randomUUID();
      tagIds.set(name, id);
      return { id, userId, name, color };
    }),
  );

  // Workout sessions over the history window
  const sessionRows: (typeof workoutSessions.$inferInsert)[] = [];
  const perfRows: (typeof exercisePerformances.$inferInsert)[] = [];
  const setRows: (typeof sets.$inferInsert)[] = [];
  const sessionTagRows: (typeof workoutSessionTags.$inferInsert)[] = [];

  for (let d = HISTORY_DAYS; d >= 1; d--) {
    const date = dayOffset(d);
    const tName = DAY_TEMPLATE[date.getDay()];
    if (!tName) continue;
    if (Math.random() < 0.12) continue; // missed the odd session
    const week = Math.floor((HISTORY_DAYS - d) / 7);

    const sessionId = randomUUID();
    sessionRows.push({
      id: sessionId,
      userId,
      sessionType: 'strength',
      name: tName,
      performedDate: iso(date),
      durationMinutes: 50 + Math.floor(Math.random() * 25),
      rating: 3 + Math.floor(Math.random() * 3),
      workoutTemplateId: templateIds.get(tName)!,
    });

    if (Math.random() < 0.3) {
      sessionTagRows.push({
        workoutSessionId: sessionId,
        userId,
        workoutTagId: tagIds.get(pick(['PR', 'Tough']))!,
      });
    }

    TEMPLATES[tName]!.forEach((exName, exPos) => {
      const spec = EX[exName]!;
      const perfId = randomUUID();
      perfRows.push({
        id: perfId,
        userId,
        workoutSessionId: sessionId,
        originalExerciseId: exIds.get(exName)!,
        actualExerciseId: exIds.get(exName)!,
        position: exPos,
      });

      const topW = spec.top !== undefined ? round(spec.top + week * spec.inc) : null;
      const backW = spec.back !== undefined ? round(spec.back + week * spec.inc) : null;
      const seriesWeight = (base: number | null): string | null =>
        base === null ? null : num(round(jitter(base, 0.02)));

      // top set (unless this is an isolation lift)
      let pos = 0;
      if (!spec.noTop) {
        setRows.push({
          id: randomUUID(),
          userId,
          exercisePerformanceId: perfId,
          position: pos++,
          weight: spec.bw ? null : seriesWeight(topW),
          reps: spec.tr + (Math.random() < 0.3 ? 1 : 0),
          rir: 1,
          isTopSet: true,
        });
      }
      // back-off sets
      const backCount = spec.noTop ? 4 : 3;
      for (let s = 0; s < backCount; s++) {
        setRows.push({
          id: randomUUID(),
          userId,
          exercisePerformanceId: perfId,
          position: pos++,
          weight: spec.bw ? null : seriesWeight(backW ?? topW),
          reps: spec.br - Math.floor(Math.random() * 2),
          rir: 2 + Math.floor(Math.random() * 2),
          isTopSet: false,
        });
      }
    });
  }

  await db.insert(workoutSessions).values(sessionRows);
  await db.insert(exercisePerformances).values(perfRows);
  await db.insert(sets).values(setRows);
  if (sessionTagRows.length > 0) await db.insert(workoutSessionTags).values(sessionTagRows);

  // Upcoming planned sessions (next 10 days) so the dashboard + calendar show them
  const plannedRows: (typeof plannedSessions.$inferInsert)[] = [];
  for (let d = 1; d <= 10; d++) {
    const date = dayOffset(-d);
    const tName = DAY_TEMPLATE[date.getDay()];
    if (!tName) continue;
    plannedRows.push({
      id: randomUUID(),
      userId,
      workoutTemplateId: templateIds.get(tName)!,
      scheduledDate: iso(date),
      status: 'planned',
    });
  }
  if (plannedRows.length > 0) await db.insert(plannedSessions).values(plannedRows);

  // Body measurements (~2x/week), weight trending down with noise
  const bodyRows: (typeof bodyMeasurements.$inferInsert)[] = [];
  for (let d = HISTORY_DAYS; d >= 0; d -= 3 + Math.floor(Math.random() * 2)) {
    const t = (HISTORY_DAYS - d) / HISTORY_DAYS; // 0..1
    const weight = round(84.6 - t * 3.3 + (Math.random() * 0.8 - 0.4), 0.1);
    const bf = round(18.6 - t * 2.4 + (Math.random() * 0.6 - 0.3), 0.1);
    const advanced = d % 9 < 3; // occasional tape measurements
    bodyRows.push({
      id: randomUUID(),
      userId,
      measuredDate: iso(dayOffset(d)),
      weightKg: num(weight),
      bodyFatPct: num(bf),
      waistCm: advanced ? num(round(86 - t * 4 + (Math.random() * 0.6 - 0.3), 0.1)) : null,
      bicepsCm: advanced ? num(round(38 + t * 1.2, 0.1)) : null,
    });
  }
  await db.insert(bodyMeasurements).values(bodyRows);

  // Foods
  const foodIds = new Map<string, string>();
  await db.insert(foods).values(
    FOODS.map(([name, kcal, p, c, f]) => {
      const id = randomUUID();
      foodIds.set(name, id);
      return { id, userId, name, kcal: num(kcal), proteinG: num(p), carbsG: num(c), fatG: num(f) };
    }),
  );

  // Recipe: Chicken & rice bowl
  const recipeId = randomUUID();
  const recipeName = 'Chicken & rice bowl';
  const recipeServings = 2;
  const recipeItems: [string, number][] = [
    ['Chicken breast', 300],
    ['White rice (cooked)', 350],
    ['Broccoli', 150],
    ['Olive oil', 15],
  ];
  await db
    .insert(recipes)
    .values({ id: recipeId, userId, name: recipeName, servings: recipeServings });
  await db.insert(recipeIngredients).values(
    recipeItems.map(([name, grams], i) => ({
      id: randomUUID(),
      userId,
      recipeId,
      foodId: foodIds.get(name)!,
      amountGrams: num(grams),
      position: i,
    })),
  );
  const recipeTotal = sumMacro(recipeItems.map(([name, grams]) => scaleFood(name, grams)));
  const recipePerServing: Macro = {
    kcal: recipeTotal.kcal / recipeServings,
    proteinG: recipeTotal.proteinG / recipeServings,
    carbsG: recipeTotal.carbsG / recipeServings,
    fatG: recipeTotal.fatG / recipeServings,
  };

  // Nutrition targets (historical: an older one + the current one)
  await db.insert(nutritionTargets).values([
    {
      id: randomUUID(),
      userId,
      effectiveDate: iso(dayOffset(58)),
      kcal: num(2400),
      proteinG: num(190),
      carbsG: num(250),
      fatG: num(70),
    },
    {
      id: randomUUID(),
      userId,
      effectiveDate: iso(dayOffset(18)),
      kcal: num(2200),
      proteinG: num(185),
      carbsG: num(210),
      fatG: num(65),
    },
  ]);

  // Food log for the recent window
  const logRows: (typeof foodLog.$inferInsert)[] = [];
  const addFood = (
    date: string,
    meal: (typeof foodLog.$inferInsert)['meal'],
    name: string,
    grams: number,
  ) => {
    const m = scaleFood(name, jitter(grams, 0.12));
    const q = round(jitter(grams, 0.12), 1);
    logRows.push({
      id: randomUUID(),
      userId,
      loggedDate: date,
      meal,
      foodId: foodIds.get(name)!,
      itemName: name,
      unit: 'grams',
      quantity: num(q),
      kcal: num(m.kcal),
      proteinG: num(m.proteinG),
      carbsG: num(m.carbsG),
      fatG: num(m.fatG),
    });
  };
  for (let d = DIARY_DAYS; d >= 0; d--) {
    const date = iso(dayOffset(d));
    addFood(date, 'breakfast', 'Rolled oats', 80);
    addFood(date, 'breakfast', 'Banana', 120);
    addFood(date, 'breakfast', 'Greek yogurt 2%', 150);
    // lunch: the recipe by servings
    const servings = 1;
    logRows.push({
      id: randomUUID(),
      userId,
      loggedDate: date,
      meal: 'lunch',
      recipeId,
      itemName: recipeName,
      unit: 'servings',
      quantity: num(servings),
      kcal: num(recipePerServing.kcal * servings),
      proteinG: num(recipePerServing.proteinG * servings),
      carbsG: num(recipePerServing.carbsG * servings),
      fatG: num(recipePerServing.fatG * servings),
    });
    if (Math.random() < 0.85) {
      addFood(date, 'snack', 'Almonds', 30);
      addFood(date, 'snack', 'Whey protein', 30);
    }
    addFood(date, 'dinner', 'Salmon fillet', 180);
    addFood(date, 'dinner', 'Sweet potato', 220);
    addFood(date, 'dinner', 'Broccoli', 150);
  }
  await db.insert(foodLog).values(logRows);

  console.log(
    `Done. Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}\n` +
      `  ${sessionRows.length} workouts · ${setRows.length} sets · ${bodyRows.length} measurements · ${logRows.length} diary entries`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
