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

import { useRegister } from '../hooks/use-register';
import { useAuthTranslation } from '../i18n';
import { registerSchema, type RegisterInput } from '../types';

interface RegisterFormProps {
  // Called after a successful registration (e.g. to navigate away). useRegister
  // already seeds the cache, so the new account is signed in immediately.
  onSuccess?: () => void;
}

const FIELD = 'h-12 rounded-xl border-[#e8e1da] bg-[#fdfbf9]';

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const { mutate, isPending, error } = useRegister();
  const t = useAuthTranslation();

  function onSubmit(values: RegisterInput) {
    mutate(values, { onSuccess: () => onSuccess?.() });
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="grid gap-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.name}</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="name" className={FIELD} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  className={FIELD}
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
                <Input type="password" autoComplete="new-password" className={FIELD} {...field} />
              </FormControl>
              <p className="text-[11.5px] text-[#94858b]">{t.register.minChars}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Server-side failures (e.g. email already in use, network). Field-level
            Zod errors render via FormMessage above. */}
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error.message}
          </p>
        ) : null}

        <Button type="submit" className="mt-1 h-12 w-full rounded-full" disabled={isPending}>
          {isPending ? t.register.creating : t.register.createAccount}
        </Button>
      </form>
    </Form>
  );
}
