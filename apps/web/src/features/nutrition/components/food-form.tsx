import { zodResolver } from '@hookform/resolvers/zod';
import { Apple, Camera, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { markFilePickActive } from '@/hooks/use-sheet-back-close';
import { FIELD_CLASS, LABEL_CLASS, NUMBER_FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import type { CreateFoodInput, Food } from '@gym-bro/shared';

import { useCreateFood } from '../hooks/use-create-food';
import { useUpdateFood } from '../hooks/use-update-food';
import { useNutritionTranslation } from '../i18n';
import type { ScanPrefill } from '../stores/food-ui.store';
import { MACRO_BAR, type MacroKey } from '../utils/macro-colors';
import { resizeImageToDataUrl } from '../utils/resize-image';

// A required macro field: kept as a string in the form (so a half-typed "2." is
// preserved and an empty field is a clear "Required", not a silent 0) and
// validated against the per-100g numeric range. Converted to a number on submit
// (no Zod transform, so the form's input and output types stay identical — which
// keeps FormField inference happy across the mapped fields below).
const macroField = z
  .string()
  .trim()
  .min(1, 'Required')
  .refine((v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n <= 9999.99;
  }, 'Enter a number 0–9999.99');

// Optional gram-size field (serving or unit weight). Blank = not set; a value lets
// the food be logged by that portion too (e.g. "1 serving = 150 g", "1 unit = 9 g").
const gramSizeField = z
  .string()
  .trim()
  .refine((v) => {
    if (v === '') return true;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 && n <= 99999.99;
  }, 'Enter a number greater than 0');

// Optional barcode typed by hand when adding a product that wasn't scanned. Blank =
// none; otherwise a valid 8–14 digit code. Scanned/known barcodes are shown locked
// (read-only under the photo), not through this field.
const manualEanField = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\d{8,14}$/.test(v), 'Enter a valid 8–14 digit barcode');

const foodFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  kcal: macroField,
  proteinG: macroField,
  carbsG: macroField,
  fatG: macroField,
  servingGrams: gramSizeField,
  unitGrams: gramSizeField,
  ean: manualEanField,
});

type FoodFormValues = z.infer<typeof foodFormSchema>;

// Field key → its macro-label key in the translation dict; labels resolve at render.
const MACRO_FIELDS = ['kcal', 'proteinG', 'carbsG', 'fatG'] as const;

// Form field → its macro colour key (for the dot before each label).
const MACRO_KEY: Record<(typeof MACRO_FIELDS)[number], MacroKey> = {
  kcal: 'kcal',
  proteinG: 'protein',
  carbsG: 'carbs',
  fatG: 'fat',
};

interface FoodFormProps {
  editing: Food | null;
  // Seed values when adding a scanned product (barcode + whatever we know).
  prefill?: ScanPrefill | null;
  // Called with the created food (create only) — lets the diary select it to log.
  onCreated?: ((food: Food) => void) | undefined;
  onSuccess: () => void;
  // 'sheet' (default): the mobile add/edit sheet. 'panel': the desktop side card — the
  // photo moves into a header with the title, and macros sit in one row of four.
  layout?: 'sheet' | 'panel';
  panelTitle?: string;
  panelDescription?: string;
}

// Macro label colours for the desktop panel's one-row macro fields.
const MACRO_LABEL_COLOR: Record<(typeof MACRO_FIELDS)[number], string> = {
  kcal: '',
  proteinG: 'text-[#8d4a5e] dark:text-[#f0bccb]',
  carbsG: 'text-[#b8862a] dark:text-[#d9a441]',
  fatG: 'text-[#5a7a52] dark:text-[#8fae85]',
};

// In a card the fields sit on parchment rather than the card's own white.
const PANEL_FIELD = 'bg-[#f6f3f0] dark:bg-[#171316]';

// Create/edit a food. Macros are entered per 100g. The shared schema is the
// source of truth on the server; this local schema mirrors it with form-friendly
// string inputs and messages. A scan prefill seeds the fields and carries the
// barcode/brand/image through to submit.
export function FoodForm({
  editing,
  prefill = null,
  onCreated,
  onSuccess,
  layout = 'sheet',
  panelTitle,
  panelDescription,
}: FoodFormProps) {
  const t = useNutritionTranslation();
  const panel = layout === 'panel';
  const fieldClass = panel ? cn(FIELD_CLASS, PANEL_FIELD) : FIELD_CLASS;
  const numberFieldClass = panel
    ? cn(NUMBER_FIELD_CLASS, PANEL_FIELD, 'text-center text-[17px]')
    : NUMBER_FIELD_CLASS;
  // Short macro names for the panel's narrow four-up fields.
  const macroShortLabel: Record<(typeof MACRO_FIELDS)[number], string> = {
    kcal: 'kcal',
    proteinG: t.common.macroProtein,
    carbsG: t.common.macroCarbs,
    fatG: t.common.macroFat,
  };
  // A barcode from a scan or an already-saved food is fixed: shown read-only under the
  // photo and merged back in on submit. A manual add exposes an editable EAN field
  // instead (see `showEanField`). Brand is carried through the same way.
  const lockedEan = editing?.ean ?? prefill?.ean ?? null;
  const brand = editing?.brand ?? prefill?.brand ?? null;
  const showEanField = !editing && !lockedEan;

  // The preview image: an OFF URL (scanned) or a resized data-URI (user photo).
  // Editable — the user can take/replace or remove it.
  const [image, setImage] = useState<string | null>(editing?.imageUrl ?? prefill?.imageUrl ?? null);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setImage(await resizeImageToDataUrl(file));
    } catch {
      toast.error(t.common.imageProcessError);
    }
  }

  const seed = editing ?? prefill;
  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: seed
      ? {
          name: seed.name,
          kcal: seed.kcal !== null ? String(seed.kcal) : '',
          proteinG: seed.proteinG !== null ? String(seed.proteinG) : '',
          carbsG: seed.carbsG !== null ? String(seed.carbsG) : '',
          fatG: seed.fatG !== null ? String(seed.fatG) : '',
          servingGrams: seed.servingGrams !== null ? String(seed.servingGrams) : '',
          unitGrams: seed.unitGrams !== null ? String(seed.unitGrams) : '',
          ean: '',
        }
      : {
          name: '',
          kcal: '',
          proteinG: '',
          carbsG: '',
          fatG: '',
          servingGrams: '',
          unitGrams: '',
          ean: '',
        },
  });

  // When the product will land in the shared global catalog on save (a scan, or a
  // manually-typed barcode) we prompt the user to make the name clear and verify the
  // macros. Found-in-catalog products never reach this form, so a locked/typed EAN here
  // always means "new global product".
  const typedEan = form.watch('ean');
  const contributing =
    !editing && (Boolean(lockedEan) || /^\d{8,14}$/.test((typedEan ?? '').trim()));

  const create = useCreateFood();
  const update = useUpdateFood();
  const isPending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  function onSubmit(values: FoodFormValues) {
    const typed = values.ean.trim();
    const finalEan = lockedEan ?? (typed !== '' ? typed : null);
    const input: CreateFoodInput = {
      name: values.name,
      kcal: Number(values.kcal),
      proteinG: Number(values.proteinG),
      carbsG: Number(values.carbsG),
      fatG: Number(values.fatG),
      ...(values.servingGrams.trim() !== '' ? { servingGrams: Number(values.servingGrams) } : {}),
      ...(values.unitGrams.trim() !== '' ? { unitGrams: Number(values.unitGrams) } : {}),
      ...(finalEan ? { ean: finalEan } : {}),
      ...(brand ? { brand } : {}),
      ...(image ? { imageUrl: image } : {}),
    };
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess });
    } else {
      create.mutate(input, {
        onSuccess: (food) => {
          onSuccess();
          onCreated?.(food);
        },
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className={cn('grid gap-4', panel ? 'p-6' : 'px-5 pt-4 pb-6 sm:px-6')}
      >
        {/* Photo slot + one picker for both states: "Add photo" when empty, "Change
            photo" over an existing image (a scanned OFF photo is often low-quality, so
            replacing it matters as much as the first upload). In the desktop panel the
            slot doubles as the card header, next to the title. */}
        <div className={cn('flex items-center', panel ? 'gap-5' : 'gap-4')}>
          {image ? (
            <div className="relative shrink-0">
              <img
                src={image}
                alt=""
                className={cn(
                  'bg-muted object-cover',
                  panel ? 'size-[72px] rounded-2xl' : 'size-16 rounded-[14px]',
                )}
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                aria-label={t.common.removePhoto}
                className="bg-background absolute -top-1.5 -right-1.5 rounded-full border p-0.5 shadow"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : panel ? (
            <span className="bg-muted flex size-[72px] shrink-0 items-center justify-center rounded-2xl text-[#a8969d]">
              <Apple className="size-7" />
            </span>
          ) : (
            <span className="text-muted-foreground flex size-16 shrink-0 items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-[#d6c8bd] dark:border-[#3d363a]">
              <Camera className="size-5" />
            </span>
          )}
          <div className="flex min-w-0 flex-col">
            {panel ? (
              <>
                <h2 className="font-heading text-[22px] leading-tight font-semibold">
                  {panelTitle}
                </h2>
                <p className="text-muted-foreground text-[13px]">{panelDescription}</p>
              </>
            ) : null}
            <label
              className={cn(
                'text-primary w-fit cursor-pointer font-semibold hover:underline',
                panel ? 'mt-1 text-[13.5px]' : 'text-[14px]',
              )}
            >
              {image ? t.common.changePhoto : t.common.addPhoto}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                // The camera return can emit a spurious popstate on Android; flag the
                // pick so the enclosing sheet ignores it instead of closing mid-flow.
                onClick={() => markFilePickActive()}
                onChange={(e) => void onPickImage(e)}
              />
            </label>
            {brand ? (
              <span className="text-muted-foreground truncate text-[12.5px]">{brand}</span>
            ) : null}
            {lockedEan && !panel ? (
              <span className="text-muted-foreground text-[11.5px]">
                {t.foodForm.barcodeLabel(lockedEan)}
              </span>
            ) : null}
            {!brand && !lockedEan && !panel ? (
              <span className="text-muted-foreground text-[12.5px]">{t.foodForm.optional}</span>
            ) : null}
          </div>
        </div>

        {contributing ? (
          <div className="bg-accent rounded-xl border border-[#e0d3d8] p-3 text-[13px] dark:border-[#3d2c34]">
            <p className="font-semibold">{t.foodForm.contributingTitle}</p>
            <p className="text-muted-foreground mt-1">{t.foodForm.contributingDesc}</p>
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>{t.common.name}</FormLabel>
              <FormControl>
                <Input placeholder={t.foodForm.namePlaceholder} className={fieldClass} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showEanField ? (
          <FormField
            control={form.control}
            name="ean"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL_CLASS}>{t.foodForm.barcodeOptional}</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder={t.foodForm.barcodePlaceholder}
                    className={fieldClass}
                    {...field}
                  />
                </FormControl>
                <p className="text-muted-foreground text-[11.5px]">{t.foodForm.eanHint}</p>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <div className="grid gap-3">
          <p className="text-muted-foreground text-[11px] font-bold tracking-[0.08em] uppercase">
            {t.foods.macrosPer100g}
          </p>
          {/* Sheet: a 2×2 grid, dot + full label. Panel: one row of four, the short
              label tinted in its macro colour. */}
          <div className={cn('grid gap-3', panel ? 'grid-cols-4' : 'grid-cols-2')}>
            {MACRO_FIELDS.map((macro) => (
              <FormField
                key={macro}
                control={form.control}
                name={macro}
                render={({ field }) => (
                  <FormItem>
                    {panel ? (
                      <FormLabel className={cn(LABEL_CLASS, MACRO_LABEL_COLOR[macro])}>
                        {macroShortLabel[macro]}
                      </FormLabel>
                    ) : (
                      <FormLabel className={cn(LABEL_CLASS, 'items-center gap-1.5')}>
                        {macro === 'kcal' ? null : (
                          <span
                            className={cn(
                              'size-1.5 shrink-0 rounded-full',
                              MACRO_BAR[MACRO_KEY[macro]],
                            )}
                            aria-hidden
                          />
                        )}
                        {t.common.macroFields[macro]}
                      </FormLabel>
                    )}
                    <FormControl>
                      <Input
                        inputMode="decimal"
                        placeholder="0"
                        className={numberFieldClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* Serving and unit weights share a row and one hint. */}
        <div className="grid gap-1.5">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="servingGrams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL_CLASS}>{t.foodForm.servingShort}</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="decimal"
                      placeholder={t.foodForm.servingGramsPlaceholder}
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitGrams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL_CLASS}>{t.foodForm.unitShort}</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="decimal"
                      placeholder={t.foodForm.unitGramsPlaceholder}
                      className={fieldClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {panel ? (
            lockedEan ? (
              <p className="text-muted-foreground mt-1 text-[11.5px]">
                {t.foodForm.barcodeLabel(lockedEan)}
              </p>
            ) : null
          ) : (
            <p className="text-muted-foreground text-[11.5px]">{t.foodForm.portionsHint}</p>
          )}
        </div>

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/60 inline-flex h-12 items-center justify-center gap-2 rounded-full text-[14.5px] font-semibold transition-colors disabled:pointer-events-none"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isPending ? t.common.saving : editing ? t.common.saveChanges : t.foods.addFood}
        </button>
      </form>
    </Form>
  );
}
