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
import { registerSchema, type RegisterInput } from '../types';

interface RegisterFormProps {
  // Called after a successful registration (e.g. to navigate away). useRegister
  // already seeds the cache, so the new account is signed in immediately.
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });
  const { mutate, isPending, error } = useRegister();

  function onSubmit(values: RegisterInput) {
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder=""
                  className="h-11"
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" className="h-11" {...field} />
              </FormControl>
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

        <Button type="submit" className="h-11 w-full" disabled={isPending}>
          {isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </Form>
  );
}
