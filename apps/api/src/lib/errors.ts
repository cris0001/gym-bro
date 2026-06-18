// Base class for all expected, handled application errors. The global error
// handler reads `statusCode`, `code`, and `message` to build the consistent
// `{ error: { message, code } }` response. Anything that is NOT an AppError is
// treated as an unexpected 500.
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  // Stable, machine-readable code the frontend can switch on.
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

// 400 — request failed schema validation. Carries optional field-level details
// (field path -> messages) so the client can show per-field errors.
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';

  constructor(
    message = 'Validation failed',
    readonly details?: Record<string, string[]>,
  ) {
    super(message);
  }
}

// 401 — bad credentials, or a missing/invalid auth token.
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';

  constructor(message = 'Unauthorized') {
    super(message);
  }
}

// 404 — requested resource does not exist.
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';

  constructor(message = 'Not found') {
    super(message);
  }
}

// 409 — request conflicts with current state (e.g. duplicate email).
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';

  constructor(message = 'Conflict') {
    super(message);
  }
}

// 500 — fallback for unexpected failures we still want to throw explicitly.
export class InternalError extends AppError {
  readonly statusCode = 500;
  readonly code = 'INTERNAL';

  constructor(message = 'Internal server error') {
    super(message);
  }
}
