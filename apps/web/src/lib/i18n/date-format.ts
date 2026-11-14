import { format, getDefaultOptions } from 'date-fns';

// English-ordered day/month patterns and their Polish order (day before month:
// "14 lis", "sobota, 14 listopada"). Month/day names already follow the UI language
// via applyDateLocale; this only fixes the order.
const PL_ORDER: Record<string, string> = {
  'MMM d': 'd MMM',
  'EEE, MMM d': 'EEE, d MMM',
  'EEEE, MMM d': 'EEEE, d MMM',
  'EEEE, MMMM d': 'EEEE, d MMMM',
  'MMM d, yyyy': 'd MMM yyyy',
  'EEEE, MMM d, yyyy': 'EEEE, d MMM yyyy',
};

// `format` for day+month patterns, reordered for the active date locale.
export function formatDate(date: Date | number, pattern: keyof typeof PL_ORDER): string {
  const polish = getDefaultOptions().locale?.code === 'pl';
  return format(date, polish ? (PL_ORDER[pattern] ?? pattern) : pattern);
}
