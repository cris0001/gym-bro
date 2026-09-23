import { Plus } from 'lucide-react';
import { useState } from 'react';

import type { ExerciseCategory } from '@gym-bro/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useExerciseUiStore } from '../stores/exercise-ui.store';
import { CategoryFilter } from './category-filter';
import { ExerciseList } from './exercise-list';
import { ExerciseSheet } from './exercise-sheet';

// The Exercise Library screen: a header with the Add action, a category filter, the
// list, and the create/edit Sheet (which reads its own open state from the UI
// store). null category = show all (the default).
export function ExercisesPage() {
  const openCreate = useExerciseUiStore((s) => s.openCreate);
  const [category, setCategory] = useState<ExerciseCategory | null>(null);
  const [search, setSearch] = useState('');

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-4xl flex-col gap-3 p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-[28px] leading-none font-medium">Exercises</h1>
        <Button type="button" className="h-11 rounded-full px-5" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          placeholder="Search exercises"
          className="h-11 md:max-w-[360px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CategoryFilter value={category} onChange={setCategory} />
      </div>
      {/* Mobile: one card holding the list. Desktop: the grid cards carry their own
          surface, so the wrapper drops its chrome. */}
      <div className="bg-card overflow-hidden rounded-2xl border md:overflow-visible md:rounded-none md:border-0 md:bg-transparent">
        <ExerciseList category={category} search={search} />
      </div>
      <ExerciseSheet />
    </div>
  );
}
