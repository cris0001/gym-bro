import { useMutation } from '@tanstack/react-query';

import type { EstimateMacrosInput } from '@gym-bro/shared';

import { estimateFoodPhoto } from '../api/food-log';

// Ask the server (Gemini) to estimate macros from a food photo. Not cached — each call
// is a fresh estimate the user then reviews and saves as a custom entry, so a mutation
// (not a query) fits: it's an action with a one-off result, no key to invalidate.
export function useEstimateFoodPhoto() {
  return useMutation({
    mutationFn: (input: EstimateMacrosInput) => estimateFoodPhoto(input),
  });
}
