import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/use-translation';

import { useLogout } from '../hooks/use-logout';

export function LogoutButton() {
  const navigate = useNavigate();
  const { mutate, isPending } = useLogout();
  const { t } = useTranslation();

  function onClick() {
    mutate(undefined, { onSuccess: () => void navigate({ to: '/login' }) });
  }

  return (
    <Button variant="ghost" size="sm" disabled={isPending} onClick={onClick}>
      {isPending ? t.common.loggingOut : t.common.logout}
    </Button>
  );
}
