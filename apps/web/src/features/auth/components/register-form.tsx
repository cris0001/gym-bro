import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
import { AUTH_FIELD, AUTH_SUBMIT } from '../utils/auth-styles';
import { type Consents, RegisterConsents } from './register-consents';

interface RegisterFormProps {
  // Called after a successful registration (e.g. to navigate away). useRegister
  // already seeds the cache, so the new account is signed in immediately.
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  const { mutate, isPending, error } = useRegister();
  const t = useAuthTranslation();
  const [consents, setConsents] = useState<Consents>({ terms: false, health: false });
  const [triedSubmit, setTriedSubmit] = useState(false);

  function onSubmit(values: RegisterInput) {
    // Both consents are required to sign up (they aren't sent — ticking them is the
    // act of consenting; the policy records what was agreed to).
    if (!consents.terms || !consents.health) return;
    mutate(values, { onSuccess: () => onSuccess?.() });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          setTriedSubmit(true);
          void form.handleSubmit(onSubmit)(e);
        }}
        className="grid gap-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.name}</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="name" className={AUTH_FIELD} {...field} />
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
                  className={AUTH_FIELD}
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
                  autoComplete="new-password"
                  className={AUTH_FIELD}
                  {...field}
                />
              </FormControl>
              <p className="text-[11.5px] text-[#5b6170]">{t.register.minChars}</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <RegisterConsents value={consents} onChange={setConsents} showError={triedSubmit} />

        {/* Server-side failures (e.g. email already in use, network). Field-level
            Zod errors render via FormMessage above. */}
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error.message}
          </p>
        ) : null}

        <Button type="submit" className={AUTH_SUBMIT} disabled={isPending}>
          {isPending ? t.register.creating : t.register.createAccount}
        </Button>
      </form>
    </Form>
  );
}
