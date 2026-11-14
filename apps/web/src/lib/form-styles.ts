// Shared class strings for form controls inside FormSheet (the warm-editorial sheet
// forms): a 36px light field with small corners, primary focus, red outline when invalid.

export const FIELD_CLASS =
  'h-9 rounded-md border-border bg-field px-3.5 text-[14px] shadow-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 aria-invalid:border-destructive aria-invalid:ring-destructive/15 md:text-[14px]';

// Numeric targets (sets / reps): the same field with a serif, semibold value.
export const NUMBER_FIELD_CLASS = `${FIELD_CLASS} font-heading text-base font-semibold tabular-nums md:text-base`;

export const TEXTAREA_CLASS =
  'min-h-[76px] w-full min-w-0 rounded-md border border-border bg-field px-3.5 py-2.5 text-[14px] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50';

// Select / combobox triggers (a button that opens a list): the same 36px, small-corner
// field shape as the inputs, so pickers line up with them in a form.
export const SELECT_TRIGGER_CLASS =
  'inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-border bg-field px-3.5 text-left text-[14px] font-medium outline-none transition-colors hover:bg-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15';

export const LABEL_CLASS = 'text-[12.5px] font-semibold text-subtle-foreground';
