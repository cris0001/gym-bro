import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useFoodUiStore } from '../stores/food-ui.store';
import { FoodList } from './food-list';
import { FoodSheet } from './food-sheet';

// The food dictionary page: header + add action, a name search, the list, and the
// create/edit sheet. Mobile-first single column.
export function FoodsPage() {
  const openCreate = useFoodUiStore((s) => s.openCreate);
  const [search, setSearch] = useState('');

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Foods</h1>
        <Button type="button" className="h-11" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <Input
        placeholder="Search foods"
        className="h-11"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-card overflow-hidden rounded-xl border">
        <FoodList search={search} />
      </div>
      <FoodSheet />
    </div>
  );
}
