import { format, parseISO } from 'date-fns';
import { Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useBillingTranslation } from '../i18n';

interface PaywallModalProps {
  // The (past) expiry timestamp, shown for context. null shouldn't reach here.
  expiresAt: string | null;
  onRenew: () => void;
  onSignOut: () => void;
}

// A blocking, non-dismissible overlay shown when the licence has lapsed. There is no
// close affordance by design — the app is locked behind it until the licence is
// renewed; a quiet "Sign out" is the only way out.
export function PaywallModal({ expiresAt, onRenew, onSignOut }: PaywallModalProps) {
  const t = useBillingTranslation();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="bg-card w-full max-w-md rounded-2xl border p-6 text-center shadow-xl">
        <span className="bg-accent text-primary mx-auto flex size-12 items-center justify-center rounded-2xl">
          <Lock className="size-6" />
        </span>
        <h2 id="paywall-title" className="font-heading mt-4 text-2xl font-semibold">
          {t.title}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{t.body}</p>
        {expiresAt ? (
          <p className="text-muted-foreground/80 mt-2 text-xs">
            {t.expiredOn(format(parseISO(expiresAt), 'PP'))}
          </p>
        ) : null}
        <Button onClick={onRenew} className="mt-5 h-11 w-full rounded-full">
          {t.renew}
        </Button>
        <button
          type="button"
          onClick={onSignOut}
          className="text-muted-foreground hover:text-foreground mt-3 text-sm font-medium"
        >
          {t.signOut}
        </button>
      </div>
    </div>
  );
}
