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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Button type="button" className="h-11" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <Input
        placeholder="Search exercises"
        className="h-11"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <CategoryFilter value={category} onChange={setCategory} />
      <div className="bg-card overflow-hidden rounded-xl border">
        <ExerciseList category={category} search={search} />
      </div>
      <ExerciseSheet />
    </div>
  );
}
