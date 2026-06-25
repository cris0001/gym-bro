import { useQuery } from '@tanstack/react-query';
import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

import { activePlanQueryOptions, planQueryOptions } from '@/features/training';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TemplateOption {
  id: string;
  name: string;
}

interface TemplateComboboxProps {
  onSelect: (template: TemplateOption) => void;
}

// Searchable template picker for starting a workout. Lists the active plan's
// templates (the common case); selecting one fires onSelect. Cross-plan starts
// happen from the calendar instead, where any plan's template can be planned.
export function TemplateCombobox({ onSelect }: TemplateComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data: activePlan } = useQuery(activePlanQueryOptions());
  const { data: plan } = useQuery({
    ...planQueryOptions(activePlan?.id ?? ''),
    enabled: Boolean(activePlan?.id),
  });
  const templates = plan?.templates ?? [];

  function handleSelect(template: TemplateOption) {
    onSelect(template);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-11 w-full justify-between">
          Start from a template
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder="Search templates" />
          <CommandList>
            <CommandEmpty>
              {activePlan ? 'No templates in your active plan.' : 'No active plan set.'}
            </CommandEmpty>
            <CommandGroup>
              {templates.map((template) => (
                <CommandItem
                  key={template.id}
                  value={template.name}
                  onSelect={() => handleSelect({ id: template.id, name: template.name })}
                >
                  {template.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
