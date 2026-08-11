import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';

import { RegisterForm } from '@/features/auth';

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6">
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
