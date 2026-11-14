import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import type { ExerciseCategory } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTitle } from '@/components/page-title';
import { FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import { useExerciseUiStore } from '../stores/exercise-ui.store';
import { CategoryFilter } from './category-filter';
import { ExerciseList } from './exercise-list';
import { ExerciseSheet } from './exercise-sheet';

// The Exercise Library screen: a header with the Add action, search + category chips,
// the list (grouped by muscle under "All"), and the create/edit Sheet (which reads its
// own open state from the UI store). null category = show all (the default).
export function ExercisesPage() {
  const openCreate = useExerciseUiStore((s) => s.openCreate);
  const [category, setCategory] = useState<ExerciseCategory | null>(null);
  const [search, setSearch] = useState('');

  return (
    <div className="flex w-full flex-col gap-4 p-3 md:p-4 max-w-6xl lg:col-start-2">
      <div className="flex items-center justify-between gap-2">
        <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight">
          Exercises
        </PageTitle>
        <Button type="button" className="h-9.5 rounded-full px-5" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {/* Search + category chips: chips under the search, beside it from 1450px. */}
      <div className="flex flex-col gap-3 min-[1450px]:flex-row min-[1450px]:items-center">
        <div className="relative md:max-w-sm min-[1450px]:w-72 min-[1450px]:shrink-0">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search exercises"
            aria-label="Search exercises"
            className={cn(FIELD_CLASS, 'pl-9')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      <ExerciseList category={category} search={search} />
      <ExerciseSheet />
    </div>
  );
}
