import { Barcode, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useScanFlow } from '../hooks/use-scan-flow';
import { useFoodUiStore } from '../stores/food-ui.store';
import { BarcodeScanner } from './barcode-scanner';
import { FoodList } from './food-list';
import { FoodSheet } from './food-sheet';

// The food dictionary page: header + scan/add actions, a name search, the list, and
// the create/edit sheet. Scanning a barcode looks it up (our catalog → OpenFoodFacts)
// and opens the form prefilled. Mobile-first single column.
export function FoodsPage() {
  const openCreate = useFoodUiStore((s) => s.openCreate);
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const { handleEan } = useScanFlow();

  return (
    <div className="mx-auto lg:col-span-3 flex w-full max-w-4xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Foods</h1>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => setScanning(true)}
          >
            <Barcode className="size-4" />
            Scan
          </Button>
          <Button type="button" className="h-11" onClick={openCreate}>
            <Plus className="size-4" />
            Add
          </Button>
        </div>
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
      <BarcodeScanner
        open={scanning}
        onClose={() => setScanning(false)}
        onDetected={(ean) => {
          setScanning(false);
          void handleEan(ean);
        }}
      />
    </div>
  );
}
