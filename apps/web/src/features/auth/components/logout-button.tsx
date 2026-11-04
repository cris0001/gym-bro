import { useNavigate } from '@tanstack/react-router';
import { Loader2, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/use-translation';

import { useLogout } from '../hooks/use-logout';

// Icon-only sign-out, sized like the theme/palette toggles it sits beside, so the
// sidebar footer fits its 240px width (the text label used to push the row over).
export function LogoutButton() {
  const navigate = useNavigate();
  const { mutate, isPending } = useLogout();
  const { t } = useTranslation();

  function onClick() {
    mutate(undefined, { onSuccess: () => void navigate({ to: '/login' }) });
  }

  const label = isPending ? t.common.loggingOut : t.common.logout;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      disabled={isPending}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {isPending ? <Loader2 className="size-5 animate-spin" /> : <LogOut className="size-5" />}
    </Button>
  );
}
