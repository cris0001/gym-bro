import { Camera, X } from 'lucide-react';

import { markFilePickActive } from '@/hooks/use-sheet-back-close';

import { useNutritionTranslation } from '../i18n';

interface PhotoEstimatePickerProps {
  image: string | null;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

// The meal photo slot of the AI estimate sheet, styled like the food form's: a dashed
// camera slot (or the picked photo with a remove ×) beside a "Take / choose photo" or
// "Change photo" link.
export function PhotoEstimatePicker({ image, onPick, onRemove }: PhotoEstimatePickerProps) {
  const t = useNutritionTranslation();
  return (
    <div className="flex items-center gap-4">
      {image ? (
        <div className="relative shrink-0">
          <img src={image} alt="" className="bg-muted size-24 rounded-2xl object-cover" />
          <button
            type="button"
            onClick={onRemove}
            aria-label={t.common.removePhoto}
            className="bg-background absolute -top-1.5 -right-1.5 rounded-full border p-0.5 shadow"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <span className="text-muted-foreground border-border-strong flex size-24 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-dashed">
          <Camera className="size-6" />
        </span>
      )}
      <label className="text-primary w-fit cursor-pointer text-[14px] font-semibold hover:underline">
        {image ? t.common.changePhoto : t.photo.takePhoto}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          // The camera return can emit a spurious popstate on Android; flag the pick
          // so the sheet ignores it instead of closing mid-flow.
          onClick={() => markFilePickActive()}
          onChange={onPick}
        />
      </label>
    </div>
  );
}
