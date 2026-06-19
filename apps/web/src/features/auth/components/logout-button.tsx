import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

import { useLogout } from '../hooks/use-logout';

export function LogoutButton() {
  const navigate = useNavigate();
  const { mutate, isPending } = useLogout();

  function onClick() {
    mutate(undefined, { onSuccess: () => void navigate({ to: '/login' }) });
  }

  return (
    <Button variant="ghost" size="sm" disabled={isPending} onClick={onClick}>
      {isPending ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
