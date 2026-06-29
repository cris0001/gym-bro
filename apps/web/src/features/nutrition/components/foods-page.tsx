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
    <div className="mx-auto flex w-full max-w-2xl flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Foods</h1>
        <Button type="button" className="h-11" onClick={openCreate}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      <div className="px-4 pb-2">
        <Input
          placeholder="Search foods"
          className="h-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <FoodList search={search} />
      <FoodSheet />
    </div>
  );
}
