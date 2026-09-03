import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
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

import type { CreateFoodInput, Food } from '@gym-bro/shared';

import { useCreateFood } from '../hooks/use-create-food';
import { useUpdateFood } from '../hooks/use-update-food';
import type { ScanPrefill } from '../stores/food-ui.store';
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

const MACRO_FIELDS = [
  { name: 'kcal', label: 'Calories (kcal)' },
  { name: 'proteinG', label: 'Protein (g)' },
  { name: 'carbsG', label: 'Carbs (g)' },
  { name: 'fatG', label: 'Fat (g)' },
] as const;

interface FoodFormProps {
  editing: Food | null;
  // Seed values when adding a scanned product (barcode + whatever we know).
  prefill?: ScanPrefill | null;
  // Called with the created food (create only) — lets the diary select it to log.
  onCreated?: ((food: Food) => void) | undefined;
  onSuccess: () => void;
}

// Create/edit a food. Macros are entered per 100g. The shared schema is the
// source of truth on the server; this local schema mirrors it with form-friendly
// string inputs and messages. A scan prefill seeds the fields and carries the
// barcode/brand/image through to submit.
export function FoodForm({ editing, prefill = null, onCreated, onSuccess }: FoodFormProps) {
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
      toast.error("Couldn't process that image.");
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
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="grid gap-4 p-4">
        <div className="flex flex-col items-center gap-2">
          {image ? (
            <div className="relative">
              <img src={image} alt="" className="bg-muted size-34 rounded-lg border object-cover" />
              <button
                type="button"
                onClick={() => setImage(null)}
                aria-label="Remove photo"
                className="bg-background absolute -top-2 -right-2 rounded-full border p-1 shadow"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}
          {/* One picker for both states: "Add photo" when empty, "Change photo" over an
              existing image (a scanned OFF photo is often low-quality, so replacing it
              matters as much as the first upload). */}
          <Button
            asChild
            type="button"
            variant={image ? 'ghost' : 'outline'}
            className={image ? 'h-9' : 'h-11'}
          >
            <label>
              <Camera className="size-4" />
              {image ? 'Change photo' : 'Add photo'}
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
          </Button>
          {brand ? <p className="text-muted-foreground text-sm">{brand}</p> : null}
          {lockedEan ? <p className="text-muted-foreground text-xs">Barcode: {lockedEan}</p> : null}
        </div>

        {contributing ? (
          <div className="border-primary/30 bg-primary/5 rounded-md border p-3 text-sm">
            <p className="font-medium">Adding to the shared product database</p>
            <p className="text-muted-foreground mt-1">
              Give it a clear, specific name and double-check the macros per 100&nbsp;g so other
              users recognise it.
            </p>
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Chicken breast" className="h-11" {...field} />
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
                <FormLabel>Barcode (optional)</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder="e.g. 5900000000000"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <p className="text-muted-foreground text-xs">
                  Add an EAN to share this product globally and find it later by scanning.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <p className="text-muted-foreground text-sm">Macros per 100g.</p>

        <div className="grid grid-cols-2 gap-3">
          {MACRO_FIELDS.map((macro) => (
            <FormField
              key={macro.name}
              control={form.control}
              name={macro.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{macro.label}</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="0" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="servingGrams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grams per serving (optional)</FormLabel>
              <FormControl>
                <Input
                  inputMode="decimal"
                  placeholder="e.g. 150"
                  className="h-11 w-40"
                  {...field}
                />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                Set this to log the food by serving as well as by grams.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unitGrams"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grams per unit (optional)</FormLabel>
              <FormControl>
                <Input inputMode="decimal" placeholder="e.g. 9" className="h-11 w-40" {...field} />
              </FormControl>
              <p className="text-muted-foreground text-xs">
                Set this to log the food by unit/piece (e.g. 1 cracker) as well as by grams.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error.message}
          </p>
        ) : null}

        <Button type="submit" className="h-11" disabled={isPending}>
          {isPending ? 'Saving…' : editing ? 'Save changes' : 'Add food'}
        </Button>
      </form>
    </Form>
  );
}
