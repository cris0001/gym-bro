import { Link, useNavigate } from '@tanstack/react-router';
import { Barcode, ChevronLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import { divideMacros, scaleMacros, sumMacros } from '@gym-bro/shared';
import type { CreateRecipeInput, RecipeDetail } from '@gym-bro/shared';

import { useCreateRecipe } from '../hooks/use-create-recipe';
import { useScanFlow } from '../hooks/use-scan-flow';
import { useUpdateRecipe } from '../hooks/use-update-recipe';
import { useNutritionTranslation } from '../i18n';
import {
  draftFromFood,
  fromDetail,
  rowGrams,
  type IngredientDraft,
  type IngredientFood,
  type PickableFood,
} from '../utils/recipe-draft';
import { resizeImageToDataUrl } from '../utils/resize-image';
import { BarcodeScanner } from './barcode-scanner';
import { FoodCombobox } from './food-combobox';
import { FoodSheet } from './food-sheet';
import { RECIPE_TABLE_COLUMNS, RecipeIngredientRow } from './recipe-ingredient-row';
import { RecipePerServingCard } from './recipe-per-serving-card';
import { RecipePhoto } from './recipe-photo';
import { RecipeServingsCard } from './recipe-servings-card';

interface RecipeBuilderProps {
  editing: RecipeDetail | null;
}

// Recipe builder (create + edit) for a dish composed of foods. Ingredients live in
// local draft state (raw strings, per the numeric-input pattern); the macro preview is
// computed live from the shared macro math. Rendered full-page on its own route: one
// column on phones and tablets, three (photo | name + ingredients | servings + summary
// + actions) from 1280px. (Bought/prepared products are modelled as foods with a
// serving size, not recipes.)
export function RecipeBuilder({ editing }: RecipeBuilderProps) {
  const t = useNutritionTranslation();
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
      toast.error(t.common.imageProcessError);
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
  // ingredient (tap its row to edit the amount/unit).
  const { handleEan } = useScanFlow((food) => addIngredient(food));

  // Append a picked food as a new ingredient (default 100 g) and open its editor so the
  // amount can be set straight away. Hoisted so the scan flow above can call it.
  function addIngredient(food: PickableFood) {
    const key = crypto.randomUUID();
    setIngredients((rows) => [...rows, draftFromFood(food, key)]);
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

  const short = t.common.macroShort;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-3 md:p-4 lg:col-span-3">
      <Link
        to="/recipes"
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-[14px] font-semibold"
      >
        <ChevronLeft className="size-4" />
        {t.recipes.title}
      </Link>

      {/* Phones: the photo tile sits beside the title. Desktop: the title alone. */}
      <div className="flex items-center gap-4">
        <RecipePhoto
          variant="slot"
          className="xl:hidden"
          imageUrl={imageUrl}
          onPick={(e) => void onPickImage(e)}
          onRemove={() => setImageUrl(null)}
        />
        <h1 className="font-heading min-w-0 text-[26px] leading-tight font-medium break-words xl:text-[30px]">
          {name.trim() || (editing ? t.recipes.editRecipe : t.recipes.newRecipe)}
        </h1>
      </div>

      <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[240px_minmax(0,1fr)_300px] xl:items-start xl:gap-6">
        <RecipePhoto
          variant="large"
          className="hidden xl:flex"
          imageUrl={imageUrl}
          onPick={(e) => void onPickImage(e)}
          onRemove={() => setImageUrl(null)}
        />

        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid gap-2">
            <Input
              aria-label={t.common.name}
              className={FIELD_CLASS}
              placeholder={t.recipes.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-[20px] border border-[#e8e1da] bg-[#fdfbf9] dark:border-[#2f292d] dark:bg-card">
            {/* Card header: the section label on phones, the column header on desktop. */}
            <div
              className={cn(
                'text-muted-foreground px-4 pt-4 pb-3 text-[11px] font-bold tracking-[0.08em] uppercase xl:grid xl:pb-2.5',
                RECIPE_TABLE_COLUMNS,
              )}
            >
              <span>{t.recipes.ingredients}</span>
              <span className="hidden text-right xl:block">{t.recipes.amount}</span>
              <span className="hidden text-right text-[#8d4a5e] xl:block">{short.protein}</span>
              <span className="hidden text-right text-[#b8862a] xl:block">{short.carbs}</span>
              <span className="hidden text-right text-[#5a7a52] xl:block">{short.fat}</span>
              <span className="hidden text-right xl:block">kcal</span>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-muted-foreground border-t border-dashed border-[#e4dad2] px-4 py-3 text-[13px] dark:border-[#2f292d]">
                {t.recipes.noIngredients}
              </p>
            ) : (
              <ul>
                {ingredients.map((row) => (
                  <RecipeIngredientRow
                    key={row.key}
                    row={row}
                    editing={editingKey === row.key}
                    onToggleEdit={() => setEditingKey((k) => (k === row.key ? null : row.key))}
                    onChange={(patch) => updateRow(row.key, patch)}
                    onRemove={() => removeRow(row.key)}
                  />
                ))}
              </ul>
            )}

            {/* Add: search the foods dictionary, or (touch devices) scan a barcode. */}
            <div className="relative border-t border-dashed border-[#e4dad2] p-3 dark:border-[#2f292d]">
              <FoodCombobox
                variant="add"
                selectedId={null}
                selectedName={null}
                placeholder={t.recipes.searchFoodsToAdd}
                onSelect={addIngredient}
              />
              {canScan ? (
                <button
                  type="button"
                  aria-label={t.barcode.scanAria}
                  className="bg-muted text-primary hover:bg-accent absolute top-1/2 right-5 flex size-[34px] -translate-y-1/2 items-center justify-center rounded-[10px] transition-colors"
                  onClick={() => setScanning(true)}
                >
                  <Barcode className="size-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:sticky xl:top-4">
          <RecipeServingsCard servings={servings} onChange={setServings} />
          <RecipePerServingCard perServing={perServing} total={total} />

          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error.message}
            </p>
          ) : null}

          {/* Phones: Cancel | Save side by side. Desktop: Save above Cancel. */}
          <div className="grid grid-cols-[1fr_1.4fr] gap-2 xl:flex xl:flex-col-reverse">
            <button
              type="button"
              className="border-border bg-card hover:bg-muted h-11 rounded-full border text-[14px] font-semibold text-[#5f5257] transition-colors dark:text-[#c9bfc4]"
              onClick={finish}
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              disabled={!canSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50 inline-flex h-11 items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors disabled:pointer-events-none"
              onClick={save}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {isPending
                ? t.common.saving
                : editing
                  ? t.common.saveChanges
                  : t.recipes.createRecipe}
            </button>
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
