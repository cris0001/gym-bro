import { Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { FormSheet } from '@/components/form-sheet';
import { FormSheetActions } from '@/components/form-sheet-actions';
import { Input } from '@/components/ui/input';
import { FIELD_CLASS, LABEL_CLASS, TEXTAREA_CLASS } from '@/lib/form-styles';

import type { CreateFoodLogInput } from '@gym-bro/shared';

import { useCreateFoodLogEntry } from '../hooks/use-create-food-log-entry';
import { useEstimateFoodPhoto } from '../hooks/use-estimate-food-photo';
import { useNutritionTranslation } from '../i18n';
import { useDiaryUiStore } from '../stores/diary-ui.store';
import { resizeImageToDataUrl } from '../utils/resize-image';
import { PHOTO_MACRO_FIELDS, PhotoEstimateMacros, type PhotoMacros } from './photo-estimate-macros';
import { PhotoEstimatePicker } from './photo-estimate-picker';

const EMPTY_MACROS: PhotoMacros = { kcal: '', proteinG: '', carbsG: '', fatG: '' };

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
  const [macros, setMacros] = useState<PhotoMacros>(EMPTY_MACROS);
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

  const macrosValid = PHOTO_MACRO_FIELDS.every((f) => isValidMacro(macros[f]));
  const canSave = estimated && name.trim() !== '' && macrosValid;

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave || create.isPending || photoMeal === null) return;
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
    <FormSheet
      open={open}
      onClose={closePhoto}
      title={t.photo.title(photoMeal ? t.meals[photoMeal] : null)}
      description={t.photo.description}
    >
      <form onSubmit={save} className="grid gap-4 px-5 pt-4 pb-6 sm:px-6">
        <PhotoEstimatePicker
          image={image}
          onPick={(e) => void onPickImage(e)}
          onRemove={() => {
            setImage(null);
            setEstimated(false);
          }}
        />

        <label className="grid gap-1.5">
          <span className={LABEL_CLASS}>{t.common.name}</span>
          <Input
            className={FIELD_CLASS}
            placeholder={t.photo.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="grid gap-1.5">
          <span className={LABEL_CLASS}>{t.photo.noteLabel}</span>
          <textarea
            rows={2}
            className={TEXTAREA_CLASS}
            placeholder={t.photo.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        {estimated ? (
          <PhotoEstimateMacros
            macros={macros}
            onChange={(field, value) => setMacros((m) => ({ ...m, [field]: value }))}
          />
        ) : (
          <button
            type="button"
            disabled={!image || estimate.isPending}
            onClick={runEstimate}
            className="bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-primary/50 inline-flex h-11 items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors disabled:pointer-events-none"
          >
            {estimate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {estimate.isPending ? t.photo.estimating : t.photo.estimateMacros}
          </button>
        )}

        {error ? (
          <p role="alert" className="text-destructive text-[13px]">
            {error.message}
          </p>
        ) : null}

        {estimated ? (
          <FormSheetActions
            submitLabel={t.photo.saveToDiary}
            pendingLabel={t.common.saving}
            isPending={create.isPending}
            disabled={!canSave}
            onCancel={closePhoto}
          />
        ) : null}
      </form>
    </FormSheet>
  );
}
