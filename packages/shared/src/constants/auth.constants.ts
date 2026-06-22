// Closed set of sexes — fixed because it drives BMR-type calculations later.
// Mirrors the `sex` pgEnum in the API's users table. `as const` so it can seed
// both the Zod enum and the inferred Sex type from one source.
export const SEX_OPTIONS = ['male', 'female'] as const;
