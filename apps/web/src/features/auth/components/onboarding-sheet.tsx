import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useCompleteOnboarding } from '../hooks/use-complete-onboarding';
import { useCurrentUser } from '../hooks/use-current-user';
import { useAuthTranslation } from '../i18n';
import { ProfileForm } from './profile-form';

// First-run profile sheet after sign-up: the shared profile fields (birthdate, sex,
// height, food-name language), all optional — Save sends what's filled, Skip just
// marks onboarding done. Everything is editable later in Settings.
export function OnboardingSheet() {
  const { data: user } = useCurrentUser();
  const { mutate, isPending, error } = useCompleteOnboarding();
  const t = useAuthTranslation();
  // Closing via the X/overlay dismisses for this session only; the sheet
  // reappears on reload until onboardedAt is stamped (Save or Skip).
  const [dismissed, setDismissed] = useState(false);

  const open = !!user && user.onboardedAt === null && !dismissed;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && setDismissed(true)}>
      <SheetContent side="bottom" className="max-h-[92dvh] gap-0 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t.onboarding.title}</SheetTitle>
          <SheetDescription>{t.onboarding.subtitle}</SheetDescription>
        </SheetHeader>

        <div className="p-4">
          <ProfileForm
            user={null}
            mode="only-set"
            onSubmit={(input) => mutate(input)}
            isPending={isPending}
            error={error}
            secondaryAction={
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground h-10 rounded-full"
                disabled={isPending}
                onClick={() => mutate({})}
              >
                {t.onboarding.skip}
              </Button>
            }
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
