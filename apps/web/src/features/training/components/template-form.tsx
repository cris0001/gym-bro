import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FormSheetActions } from '@/components/form-sheet-actions';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FIELD_CLASS, LABEL_CLASS, TEXTAREA_CLASS } from '@/lib/form-styles';
import {
  createTemplateSchema,
  type CreateTemplateInput,
  type WorkoutTemplate,
} from '@gym-bro/shared';

import { useCreateTemplate } from '../hooks/use-create-template';
import { useUpdateTemplate } from '../hooks/use-update-template';
import { OptionalHint } from './optional-hint';
import { useTrainingTranslation } from '../i18n';

interface TemplateFormProps {
  // The row being edited, or null for create mode.
  editing: WorkoutTemplate | null;
  // The plan to create the template in (used in create mode).
  planId: string | null;
  // Called after a successful create/update (the sheet closes on this).
  onSuccess: () => void;
  onCancel: () => void;
}

export function TemplateForm({ editing, planId, onSuccess, onCancel }: TemplateFormProps) {
  const t = useTrainingTranslation();
  const form = useForm<CreateTemplateInput>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: editing?.name ?? '',
      shortName: editing?.shortName ?? null,
      description: editing?.description ?? '',
    },
  });

  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const isPending = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  function onSubmit(values: CreateTemplateInput) {
    const description = values.description ?? '';
    const input: CreateTemplateInput = {
      name: values.name,
      shortName: values.shortName ?? null,
      description: description.length > 0 ? description : null,
    };
    if (editing) {
      update.mutate({ id: editing.id, input }, { onSuccess });
    } else if (planId) {
      create.mutate({ planId, input }, { onSuccess });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="grid gap-4 px-5 pt-3 pb-6 sm:px-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>{t.common.name}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t.templates.namePlaceholder}
                  className={FIELD_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shortName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>
                {t.templates.shortName} <OptionalHint />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t.templates.shortNamePlaceholder}
                  maxLength={5}
                  autoCapitalize="characters"
                  className={FIELD_CLASS}
                  value={field.value ?? ''}
                  // Empty → null so a blank box clears the abbreviation instead of
                  // failing the 1–5 character rule.
                  onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription className="text-[12px]">{t.templates.shortNameHint}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>
                {t.common.description} <OptionalHint />
              </FormLabel>
              <FormControl>
                <textarea
                  placeholder={t.templates.descriptionPlaceholder}
                  className={TEXTAREA_CLASS}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error.message}
          </p>
        ) : null}

        <FormSheetActions
          submitLabel={editing ? t.common.saveChanges : t.templates.add}
          isPending={isPending}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
