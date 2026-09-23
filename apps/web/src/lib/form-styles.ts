// Shared class strings for form controls inside FormSheet (the warm-editorial sheet
// forms): a light field on the parchment sheet, plum focus, red outline when invalid.

export const FIELD_CLASS =
  'h-11 rounded-xl border-[#e8e1da] bg-[#fdfbf9] px-3.5 text-[14px] shadow-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 aria-invalid:border-destructive aria-invalid:ring-destructive/15 md:text-[14px] dark:border-[#3a3035] dark:bg-[#282124]';

// Numeric targets (sets / reps): the same field with a serif, semibold value.
export const NUMBER_FIELD_CLASS = `${FIELD_CLASS} font-heading text-base font-semibold md:text-base`;

export const TEXTAREA_CLASS =
  'min-h-[76px] w-full min-w-0 rounded-xl border border-[#e8e1da] bg-[#fdfbf9] px-3.5 py-2.5 text-[14px] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3a3035] dark:bg-[#282124]';

export const LABEL_CLASS = 'text-[12.5px] font-semibold text-[#5f5257] dark:text-[#bfb2b7]';
