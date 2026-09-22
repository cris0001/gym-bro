import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { AuthShell, RegisterForm } from '@/features/auth';

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthShell variant="register">
      <RegisterForm onSuccess={() => void navigate({ to: '/dashboard' })} />
    </AuthShell>
  );
}
