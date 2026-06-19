import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { LoginForm } from '@/features/auth';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6">
      <div className="grid gap-1 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to your account</p>
      </div>

      <LoginForm onSuccess={() => void navigate({ to: '/' })} />

      <p className="text-muted-foreground text-center text-sm">
        No account?{' '}
        <Link to="/register" className="text-primary underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
