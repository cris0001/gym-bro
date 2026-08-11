import { Link, useNavigate } from '@tanstack/react-router';
import {
  Barcode,
  Camera,
  ChevronLeft,
  Image as ImageIcon,
  Minus,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

import { divideMacros, multiplyMacros, scaleMacros, sumMacros } from '@gym-bro/shared';
import type { CreateRecipeInput, MacroTotals, RecipeDetail } from '@gym-bro/shared';

import { useCreateRecipe } from '../hooks/use-create-recipe';
import { useScanFlow } from '../hooks/use-scan-flow';
import { useUpdateRecipe } from '../hooks/use-update-recipe';
import { BarcodeScanner } from './barcode-scanner';
import { FoodCombobox } from './food-combobox';
import { FoodSheet } from './food-sheet';
import { resizeImageToDataUrl } from '../utils/resize-image';

type IngredientUnit = 'grams' | 'servings' | 'units';

interface IngredientFood {
  id: string;
  name: string;
  per100g: MacroTotals;
  servingGrams: number | null;
  unitGrams: number | null;
}

interface IngredientDraft {
  key: string;
  food: IngredientFood | null;
  amount: string;
  unit: IngredientUnit;
}

const UNIT_SHORT: Record<IngredientUnit, string> = { grams: 'g', servings: 'serv', units: 'u' };

// Grams / servings / units toggle for an ingredient's amount — only the units the food
// supports (grams always).
function UnitToggle({
  food,
  unit,
  onChange,
}: {
  food: IngredientFood | null;
  unit: IngredientUnit;
  onChange: (unit: IngredientUnit) => void;
}) {
  const options: IngredientUnit[] = ['grams'];
  if (food?.servingGrams != null) options.push('servings');
  if (food?.unitGrams != null) options.push('units');
  if (options.length === 1) return <span className="text-muted-foreground text-sm">g</span>;
  return (
    <div className="flex h-10 shrink-0 overflow-hidden rounded-md border text-sm">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'px-2.5 font-medium transition-colors',
            unit === option ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          {UNIT_SHORT[option]}
        </button>
      ))}
    </div>
  );
}

// Grams an ingredient contributes: servings/units resolve via the food's serving/unit
// weight, otherwise the amount is already grams. 0 when the row isn't usable yet.
function rowGrams(row: IngredientDraft): number {
  const n = Number(row.amount);
  if (!row.food || !Number.isFinite(n) || n <= 0) return 0;
  if (row.unit === 'servings' && row.food.servingGrams) return n * row.food.servingGrams;
  if (row.unit === 'units' && row.food.unitGrams) return n * row.food.unitGrams;
  return n;
}

// Seed the builder from a saved recipe. A line's per-100g macros are reconstructed
// from its stored (amount-scaled) macros, so editing recomputes correctly even when
// the source food was soft-deleted and is no longer in the picker. Stored amounts are
// grams, so lines start in grams (re-pick the food to switch to servings).
function fromDetail(recipe: RecipeDetail): IngredientDraft[] {
  return recipe.ingredients.map((ing) => ({
    key: ing.id,
    food: {
      id: ing.foodId,
      name: ing.foodName,
      per100g: multiplyMacros(ing.macros, 100 / ing.amountGrams),
      servingGrams: null,
      unitGrams: null,
    },
    amount: String(ing.amountGrams),
    unit: 'grams',
  }));
}

interface RecipeBuilderProps {
  editing: RecipeDetail | null;
}

// Recipe builder (create + edit) for a dish composed of foods. Ingredients live in
// local draft state (raw strings, per the numeric-input pattern); the macro preview is
// computed live from the shared macro math. Rendered full-page on its own route.
// (Bought/prepared products are modelled as foods with a serving size, not recipes.)
export function RecipeBuilder({ editing }: RecipeBuilderProps) {
  const navigate = useNavigate();
  const finish = () => void navigate({ to: '/recipes' });
  const [name, setName] = useState(editing?.name ?? '');
  const [servings, setServings] = useState(editing ? String(editing.servings) : '1');
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(
    editing ? fromDetail(editing) : [],
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(editing?.imageUrl ?? null);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setImageUrl(await resizeImageToDataUrl(file, 640));
    } catch {
      toast.error("Couldn't process that image.");
    }
  }

  const create = useCreateRecipe();
  const update = useUpdateRecipe();
  const isPending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  const [scanning, setScanning] = useState(false);
  // Scanning needs a camera — a touch device. Hide it on desktop (fine pointer).
  const canScan = useMediaQuery('(pointer: coarse)');
  // Scanning adds the product to your foods, then drops it straight in as a 100 g
  // ingredient (edit the amount/unit via its pencil).
  const { handleEan } = useScanFlow((food) => addIngredient(food));

  // Append a picked food as a new ingredient (default 100 g). Hoisted so the scan flow
  // above can call it. Structural param so both a Food (picker) and a ResolvedFood
  // (scan) satisfy it.
  function addIngredient(food: {
    id: string;
    name: string;
    kcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    servingGrams: number | null;
    unitGrams: number | null;
  }) {
    const key = crypto.randomUUID();
    setIngredients((rows) => [
      ...rows,
      {
        key,
        food: {
          id: food.id,
          name: food.name,
          per100g: {
            kcal: food.kcal,
            proteinG: food.proteinG,
            carbsG: food.carbsG,
            fatG: food.fatG,
          },
          servingGrams: food.servingGrams,
          unitGrams: food.unitGrams,
        },
        amount: '100',
        unit: 'grams',
      },
    ]);
    // Open the new row's editor straight away so you can set the amount immediately.
    setEditingKey(key);
  }

  const updateRow = (key: string, patch: Partial<IngredientDraft>) =>
    setIngredients((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const removeRow = (key: string) => {
    setIngredients((rows) => rows.filter((r) => r.key !== key));
    setEditingKey((k) => (k === key ? null : k));
  };

  const validRows = ingredients
    .map((r) => ({ row: r, grams: rowGrams(r) }))
    .filter(
      (x): x is { row: IngredientDraft & { food: IngredientFood }; grams: number } =>
        x.row.food !== null && x.grams > 0,
    );

  const total = sumMacros(validRows.map((x) => scaleMacros(x.row.food.per100g, x.grams)));
  const servingsNum = Number(servings);
  const validServings = Number.isInteger(servingsNum) && servingsNum > 0;
  const perServing = validServings ? divideMacros(total, servingsNum) : total;
  const canSave = name.trim().length > 0 && validServings && validRows.length > 0 && !isPending;

  function save() {
    if (!canSave) return;
    const input: CreateRecipeInput = {
      name: name.trim(),
      imageUrl,
      servings: servingsNum,
      ingredients: validRows.map((x) => ({ foodId: x.row.food.id, amountGrams: x.grams })),
    };
    if (editing) update.mutate({ id: editing.id, input }, { onSuccess: finish });
    else create.mutate(input, { onSuccess: finish });
  }

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-5xl flex-col gap-4 p-3 md:p-4">
      <Link
        to="/recipes"
        className="text-muted-foreground hover:text-foreground -mb-1 inline-flex w-fit items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Recipes
      </Link>
      <h1 className="font-heading text-[28px] font-medium break-words">
        {name.trim() || (editing ? 'Edit recipe' : 'New recipe')}
      </h1>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left: an optional recipe photo, medium-sized. */}
        <div className="mx-auto w-full max-w-xs lg:mx-0 lg:w-64 lg:shrink-0">
          <div className="flex flex-col gap-2">
            <div className="bg-muted relative aspect-square overflow-hidden rounded-xl border">
              {imageUrl ? (
                <img src={imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-1 text-xs">
                  <ImageIcon className="size-8 opacity-40" />
                  No photo yet
                </div>
              )}
              {imageUrl ? (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  aria-label="Remove photo"
                  className="bg-background/80 absolute top-2 right-2 rounded-full border p-1 shadow backdrop-blur"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
            <Button asChild variant="outline" size="sm" className="h-9">
              <label>
                <Camera className="size-4" />
                {imageUrl ? 'Change photo' : 'Add photo'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => void onPickImage(e)}
                />
              </label>
            </Button>
          </div>
        </div>

        {/* Right: the recipe form. */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="recipe-name">Name</Label>
            <Input
              id="recipe-name"
              className="h-11"
              placeholder="e.g. Chili"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-card overflow-hidden rounded-2xl border">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h2 className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
                  Ingredients
                </h2>
                {canScan ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-primary h-8"
                    onClick={() => setScanning(true)}
                  >
                    <Barcode className="size-4" />
                    Scan
                  </Button>
                ) : null}
              </div>
              {ingredients.length === 0 ? (
                <p className="text-muted-foreground px-4 pb-4 text-sm">
                  No ingredients yet — search below to add one.
                </p>
              ) : (
                <ul className="divide-y divide-dashed divide-[#d9c9b2] border-t border-dashed border-[#d9c9b2] dark:divide-[#41362a] dark:border-[#41362a]">
                  {ingredients.map((row) => {
                    const grams = rowGrams(row);
                    const macros =
                      row.food && grams > 0 ? scaleMacros(row.food.per100g, grams) : null;
                    const isRowEditing = editingKey === row.key;
                    return (
                      <li key={row.key} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Edit ${row.food?.name ?? 'ingredient'}`}
                            className="min-w-0 flex-1 text-left"
                            onClick={() => setEditingKey(isRowEditing ? null : row.key)}
                          >
                            <p className="font-semibold">{row.food?.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {row.amount || '—'} {UNIT_SHORT[row.unit]}
                              {macros
                                ? ` · P ${Math.round(macros.proteinG)} · C ${Math.round(
                                    macros.carbsG,
                                  )} · F ${Math.round(macros.fatG)}`
                                : ''}
                            </p>
                          </button>
                          <span className="font-heading shrink-0 text-base font-semibold">
                            {macros ? Math.round(macros.kcal) : 0}
                          </span>
                          <button
                            type="button"
                            aria-label={`Edit ${row.food?.name ?? 'ingredient'}`}
                            className="shrink-0 text-[#c9bda9] dark:text-[#5b4e3e]"
                            onClick={() => setEditingKey(isRowEditing ? null : row.key)}
                          >
                            <Pencil className="size-4" />
                          </button>
                        </div>
                        {isRowEditing ? (
                          <div className="mt-2 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Input
                                inputMode="decimal"
                                aria-label="Amount"
                                className="h-10 w-20 text-center"
                                value={row.amount}
                                onChange={(e) => updateRow(row.key, { amount: e.target.value })}
                              />
                              <UnitToggle
                                food={row.food}
                                unit={row.unit}
                                onChange={(unit) =>
                                  updateRow(row.key, {
                                    unit,
                                    // Servings/units read as counts — start at 1 rather than
                                    // carrying over a grams amount like 100.
                                    ...(unit === 'servings' || unit === 'units'
                                      ? { amount: '1' }
                                      : {}),
                                  })
                                }
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive ml-auto size-9"
                                aria-label="Remove ingredient"
                                onClick={() => removeRow(row.key)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              = {macros ? Math.round(macros.kcal) : 0} kcal
                            </p>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <FoodCombobox
              selectedId={null}
              selectedName={null}
              placeholder="Search foods to add…"
              onSelect={addIngredient}
            />
          </div>

          <div className="bg-card flex items-center justify-between gap-4 rounded-2xl border p-4">
            <div className="min-w-0">
              <p className="text-muted-foreground text-[11px] font-medium tracking-[0.08em] uppercase">
                Servings
              </p>
              <p className="text-muted-foreground text-xs">how many portions this recipe makes</p>
            </div>
            <div className="flex h-11 shrink-0 items-center rounded-full border">
              <button
                type="button"
                aria-label="Fewer servings"
                className="text-muted-foreground flex size-11 items-center justify-center"
                onClick={() => setServings((s) => String(Math.max(1, (Number(s) || 1) - 1)))}
              >
                <Minus className="size-4" />
              </button>
              <span className="font-heading w-8 text-center text-lg font-semibold">{servings}</span>
              <button
                type="button"
                aria-label="More servings"
                className="text-primary flex size-11 items-center justify-center"
                onClick={() => setServings((s) => String((Number(s) || 0) + 1))}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-[#fdfaf4] p-5 dark:bg-[#211a12]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-xl font-semibold">Per serving</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="bg-primary size-2 rounded-full" />P{' '}
                    {Math.round(perServing.proteinG)} g
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#d9a441]" />C{' '}
                    {Math.round(perServing.carbsG)} g
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#5a7a52] dark:bg-[#8fae85]" />F{' '}
                    {Math.round(perServing.fatG)} g
                  </span>
                </div>
              </div>
              <p className="font-heading shrink-0 text-2xl font-semibold">
                {Math.round(perServing.kcal)}
                <span className="text-muted-foreground ml-1 text-sm font-normal">kcal</span>
              </p>
            </div>
            <p className="font-heading text-muted-foreground mt-2 text-xs italic">
              whole recipe: {Math.round(total.kcal).toLocaleString('en-US')} kcal · P{' '}
              {Math.round(total.proteinG)} · C {Math.round(total.carbsG)} · F{' '}
              {Math.round(total.fatG)}
            </p>
          </div>

          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error.message}
            </p>
          ) : null}

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-11 flex-1" onClick={finish}>
              Cancel
            </Button>
            <Button type="button" className="h-11 flex-1" disabled={!canSave} onClick={save}>
              {isPending ? 'Saving…' : editing ? 'Save changes' : 'Create recipe'}
            </Button>
          </div>
        </div>
      </div>

      {canScan ? (
        <BarcodeScanner
          open={scanning}
          onClose={() => setScanning(false)}
          onDetected={(ean) => {
            setScanning(false);
            void handleEan(ean);
          }}
        />
      ) : null}
      <FoodSheet />
    </div>
  );
}
