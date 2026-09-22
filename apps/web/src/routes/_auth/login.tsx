import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { AuthShell, LoginForm } from '@/features/auth';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthShell variant="signin">
      <LoginForm onSuccess={() => void navigate({ to: '/dashboard' })} />
    </AuthShell>
  );
}
