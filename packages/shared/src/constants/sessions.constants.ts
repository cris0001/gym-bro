// Closed sets mirroring the session_type and planned_status pgEnums in the
// API's session tables. `as const` so each seeds both a Zod enum and its
// inferred type from one source.

// A workout is either a strength session (exercises + sets) or an ad-hoc
// activity log (name + duration + notes).
export const SESSION_TYPES = ['strength', 'activity'] as const;

// Lifecycle of a calendar entry. 'completed' is set by the system when its
// workout is finished; the user can only set 'planned' or 'skipped'.
export const PLANNED_STATUSES = ['planned', 'completed', 'skipped'] as const;

// The statuses a user may set directly (excludes the system-managed 'completed').
export const PLANNED_STATUS_USER_SETTABLE = ['planned', 'skipped'] as const;
