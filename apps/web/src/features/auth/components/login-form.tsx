import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useLogin } from '../hooks/use-login';
import { useAuthTranslation } from '../i18n';
import { loginSchema, type LoginInput } from '../types';

interface LoginFormProps {
  // Called after a successful login (e.g. to navigate away). The cache is
  // already seeded by useLogin, so the destination sees the user immediately.
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const { mutate, isPending, error } = useLogin();
  const t = useAuthTranslation();

  function onSubmit(values: LoginInput) {
    mutate(values, { onSuccess: () => onSuccess?.() });
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="grid gap-4" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.email}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-12 rounded-xl border-[#e8e1da] bg-[#fdfbf9]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.password}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  className="h-12 rounded-xl border-[#e8e1da] bg-[#fdfbf9]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Server-side failures (bad credentials, network). Field-level Zod
            errors render via FormMessage above. */}
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error.message}
          </p>
        ) : null}

        <Button type="submit" className="mt-1 h-12 w-full rounded-full" disabled={isPending}>
          {isPending ? t.login.signingIn : t.login.signIn}
        </Button>
      </form>
    </Form>
  );
}
