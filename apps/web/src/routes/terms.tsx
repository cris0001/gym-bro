import { createFileRoute } from '@tanstack/react-router';

import { LegalPage, TERMS } from '@/features/legal';

// Public terms of service (no auth gate — linked from the landing and sign-up).
export const Route = createFileRoute('/terms')({
  component: () => <LegalPage docs={TERMS} />,
});
