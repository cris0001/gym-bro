import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { LoginForm, useAuthTranslation } from '@/features/auth';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const t = useAuthTranslation();

  return (
    <div className="grid gap-6">
      <LoginForm onSuccess={() => void navigate({ to: '/dashboard' })} />

      <p className="text-muted-foreground text-center text-sm">
        {t.login.noAccount}{' '}
        <Link to="/register" className="text-primary underline-offset-4 hover:underline">
          {t.login.createOne}
        </Link>
      </p>
    </div>
  );
}
