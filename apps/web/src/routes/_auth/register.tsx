import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { RegisterForm, useAuthTranslation } from '@/features/auth';

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const t = useAuthTranslation();

  return (
    <div className="grid gap-6">
      <RegisterForm onSuccess={() => void navigate({ to: '/dashboard' })} />

      <p className="text-muted-foreground text-center text-sm">
        {t.register.haveAccount}{' '}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          {t.register.signIn}
        </Link>
      </p>
    </div>
  );
}
