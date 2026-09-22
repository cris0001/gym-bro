import { Camera, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

import type { CreateFoodLogInput } from '@gym-bro/shared';

import { useCreateFoodLogEntry } from '../hooks/use-create-food-log-entry';
import { useEstimateFoodPhoto } from '../hooks/use-estimate-food-photo';
import { useNutritionTranslation } from '../i18n';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { resizeImageToDataUrl } from '../utils/resize-image';

const MACRO_FIELDS = ['kcal', 'proteinG', 'carbsG', 'fatG'] as const;

type MacroKey = (typeof MACRO_FIELDS)[number];
type Macros = Record<MacroKey, string>;
const EMPTY_MACROS: Macros = { kcal: '', proteinG: '', carbsG: '', fatG: '' };

function isValidMacro(value: string): boolean {
  const n = Number(value);
  return value.trim() !== '' && Number.isFinite(n) && n >= 0 && n <= 9999.99;
}

// Log a one-off "custom" diary entry from a food photo: pick a photo, add a name +
// optional note, let the AI (server → Gemini) estimate the macros, review/adjust them,
// then save. The photo is only sent for the estimate — never stored. Works on desktop
// too: the file picker opens the gallery there; mobile offers the camera.
export function PhotoEstimateSheet({ loggedDate }: { loggedDate: string }) {
  const t = useNutritionTranslation();
  const photoMeal = useDiaryUiStore((s) => s.photoMeal);
  const closePhoto = useDiaryUiStore((s) => s.closePhoto);
  const open = photoMeal !== null;

  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [macros, setMacros] = useState<Macros>(EMPTY_MACROS);
  // Once we have an estimate the form flips from "estimate" to an editable macro preview.
  const [estimated, setEstimated] = useState(false);

  const estimate = useEstimateFoodPhoto();
  const create = useCreateFoodLogEntry();

  useEffect(() => {
    if (open) {
      setImage(null);
      setName('');
      setNote('');
      setMacros(EMPTY_MACROS);
      setEstimated(false);
      estimate.reset();
      create.reset();
    }
    // Only re-init when the sheet opens; the mutations are stable.
  }, [open]);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      // A little larger than the product-photo path (768px) so the model sees detail.
      setImage(await resizeImageToDataUrl(file, 768));
      setEstimated(false);
    } catch {
      toast.error(t.common.imageProcessError);
    }
  }

  function runEstimate() {
    if (!image) return;
    estimate.mutate(
      { image, ...(note.trim() ? { description: note.trim() } : {}) },
      {
        onSuccess: (result) => {
          setMacros({
            kcal: String(Math.round(result.kcal)),
            proteinG: String(Math.round(result.proteinG)),
            carbsG: String(Math.round(result.carbsG)),
            fatG: String(Math.round(result.fatG)),
          });
          // Keep a name the user already typed; otherwise adopt the AI's suggestion.
          setName((current) => {
            const typed = current.trim();
            return typed !== '' ? typed : (result.name ?? '');
          });
          setEstimated(true);
        },
      },
    );
  }

  const macrosValid = MACRO_FIELDS.every((f) => isValidMacro(macros[f]));
  const canSave = estimated && name.trim() !== '' && macrosValid && !create.isPending;

  function save() {
    if (!canSave || photoMeal === null) return;
    const input: CreateFoodLogInput = {
      type: 'custom',
      name: name.trim(),
      kcal: Number(macros.kcal),
      proteinG: Number(macros.proteinG),
      carbsG: Number(macros.carbsG),
      fatG: Number(macros.fatG),
      source: 'ai',
      meal: photoMeal,
      loggedDate,
    };
    create.mutate(input, { onSuccess: closePhoto });
  }

  const error = estimate.error ?? create.error;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && closePhoto()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle className="capitalize">
            {t.photo.title(photoMeal ? t.meals[photoMeal] : null)}
          </SheetTitle>
          <SheetDescription>{t.photo.description}</SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 p-4">
          <div className="flex flex-col items-center gap-2">
            {image ? (
              <div className="relative">
                <img
                  src={image}
                  alt=""
                  className="bg-muted size-32 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setEstimated(false);
                  }}
                  aria-label={t.common.removePhoto}
                  className="bg-background absolute -top-2 -right-2 rounded-full border p-1 shadow"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : null}
            <Button
              asChild
              type="button"
              variant={image ? 'ghost' : 'outline'}
              className={image ? 'h-9' : 'h-11'}
            >
              <label>
                <Camera className="size-4" />
                {image ? t.common.changePhoto : t.photo.takePhoto}
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

          <div className="grid gap-2">
            <Label htmlFor="photo-name">{t.common.name}</Label>
            <Input
              id="photo-name"
              className="h-11"
              placeholder={t.photo.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="photo-note">{t.photo.noteLabel}</Label>
            <Textarea
              id="photo-note"
              rows={2}
              placeholder={t.photo.notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {estimated ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {MACRO_FIELDS.map((f) => (
                  <div key={f} className="grid gap-1.5">
                    <Label htmlFor={`photo-${f}`}>{t.common.macroFields[f]}</Label>
                    <Input
                      id={`photo-${f}`}
                      inputMode="decimal"
                      className="h-11"
                      value={macros[f]}
                      onChange={(e) => setMacros((m) => ({ ...m, [f]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">{t.photo.estimateHint}</p>
            </>
          ) : (
            <Button
              type="button"
              className="h-11"
              disabled={!image || estimate.isPending}
              onClick={runEstimate}
            >
              <Sparkles className="size-4" />
              {estimate.isPending ? t.photo.estimating : t.photo.estimateMacros}
            </Button>
          )}

          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error.message}
            </p>
          ) : null}

          <div className="flex gap-2">
            {estimated ? (
              <Button type="button" className="h-11 flex-1" disabled={!canSave} onClick={save}>
                {create.isPending ? t.common.saving : t.photo.saveToDiary}
              </Button>
            ) : null}
            <Button type="button" variant="outline" className="h-11" onClick={closePhoto}>
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
