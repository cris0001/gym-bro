import { Input } from '@/components/ui/input';
import { LABEL_CLASS, NUMBER_FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import { useNutritionTranslation } from '../i18n';
import { MACRO_BAR, type MacroKey } from '../utils/macro-colors';

export const PHOTO_MACRO_FIELDS = ['kcal', 'proteinG', 'carbsG', 'fatG'] as const;
export type PhotoMacroField = (typeof PHOTO_MACRO_FIELDS)[number];
export type PhotoMacros = Record<PhotoMacroField, string>;

const MACRO_KEY: Record<PhotoMacroField, MacroKey> = {
  kcal: 'kcal',
  proteinG: 'protein',
  carbsG: 'carbs',
  fatG: 'fat',
};

interface PhotoEstimateMacrosProps {
  macros: PhotoMacros;
  onChange: (field: PhotoMacroField, value: string) => void;
}

// The AI's macro estimate as an editable 2×2 grid (dot + label, serif values), the
// same layout as the food form's sheet, with the "review before saving" hint.
export function PhotoEstimateMacros({ macros, onChange }: PhotoEstimateMacrosProps) {
  const t = useNutritionTranslation();
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-2 gap-3">
        {PHOTO_MACRO_FIELDS.map((field) => (
          <label key={field} className="grid gap-1.5">
            <span className={cn(LABEL_CLASS, 'flex items-center gap-1.5')}>
              {field === 'kcal' ? null : (
                <span
                  className={cn('size-1.5 shrink-0 rounded-full', MACRO_BAR[MACRO_KEY[field]])}
                  aria-hidden
                />
              )}
              {t.common.macroFields[field]}
            </span>
            <Input
              inputMode="decimal"
              placeholder="0"
              className={NUMBER_FIELD_CLASS}
              value={macros[field]}
              onChange={(e) => onChange(field, e.target.value)}
            />
          </label>
        ))}
      </div>
      <p className="text-muted-foreground text-[12px]">{t.photo.estimateHint}</p>
    </div>
  );
}
