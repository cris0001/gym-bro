import { createFileRoute } from '@tanstack/react-router';

import { LegalPage, PRIVACY } from '@/features/legal';

// Public privacy policy (no auth gate — linked from the landing and sign-up).
export const Route = createFileRoute('/privacy')({
  component: () => <LegalPage docs={PRIVACY} />,
});
