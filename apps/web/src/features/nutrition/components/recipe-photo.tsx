import { Camera, Image as ImageIcon, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useNutritionTranslation } from '../i18n';

interface RecipePhotoProps {
  imageUrl: string | null;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  // 'slot': the small tile beside the title on phones — the tile itself is the picker.
  // 'large': the desktop column — a square preview with an Add/Change photo pill below.
  variant: 'slot' | 'large';
  className?: string;
}

function FileInput({ onPick }: { onPick: RecipePhotoProps['onPick'] }) {
  return (
    <input
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={onPick}
    />
  );
}

// The recipe's optional photo — dashed placeholder when empty, the image with a remove
// ✕ once set.
export function RecipePhoto({ imageUrl, onPick, onRemove, variant, className }: RecipePhotoProps) {
  const t = useNutritionTranslation();
  const removeButton = imageUrl ? (
    <button
      type="button"
      onClick={onRemove}
      aria-label={t.common.removePhoto}
      className="bg-background/85 absolute top-1.5 right-1.5 rounded-full border p-0.5 shadow backdrop-blur"
    >
      <X className="size-3.5" />
    </button>
  ) : null;

  if (variant === 'slot') {
    return (
      <div className={cn('relative size-[76px] shrink-0', className)}>
        <label
          className={cn(
            'flex size-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl',
            imageUrl
              ? ''
              : 'text-muted-foreground border-[1.5px] border-dashed border-[#d6c8bd] dark:border-[#3d363a]',
          )}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            <>
              <Camera className="size-5" />
              <span className="text-[10.5px] font-semibold">{t.common.addPhoto}</span>
            </>
          )}
          <FileInput onPick={onPick} />
        </label>
        {removeButton}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        className={cn(
          'bg-muted relative aspect-square overflow-hidden rounded-[18px]',
          !imageUrl && 'border-[1.5px] border-dashed border-[#d6c8bd] dark:border-[#3d363a]',
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 text-[13px]">
            <ImageIcon className="size-8 opacity-50" />
            {t.recipes.noPhotoYet}
          </div>
        )}
        {removeButton}
      </div>
      <label className="border-border bg-card text-primary hover:bg-muted flex h-11 cursor-pointer items-center justify-center rounded-full border text-[14px] font-semibold transition-colors">
        {imageUrl ? t.common.changePhoto : t.common.addPhoto}
        <FileInput onPick={onPick} />
      </label>
    </div>
  );
}
