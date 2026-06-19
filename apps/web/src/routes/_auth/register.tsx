import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { RegisterForm } from '@/features/auth';

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6">
      <div className="grid gap-1 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm">Start tracking your training</p>
      </div>

      <RegisterForm onSuccess={() => void navigate({ to: '/' })} />

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
