import { Barcode, Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/use-media-query';

import { useScanFlow } from '../hooks/use-scan-flow';
import { useFoodUiStore } from '../stores/food-ui.store';
import { BarcodeScanner } from './barcode-scanner';
import { FoodDetailPanel } from './food-detail-panel';
import { FoodList } from './food-list';
import { FoodSheet } from './food-sheet';

// The food dictionary page. Mobile: a single column (search + list) with a bottom-sheet
// create/edit form. Desktop (lg+): a master-detail layout — the list on the left, an
// always-visible form panel on the right (blank by default, a selected row loads it for
// editing). Scanning (mobile only) looks a barcode up and prefills the form.
export function FoodsPage() {
  const openCreate = useFoodUiStore((s) => s.openCreate);
  const editing = useFoodUiStore((s) => s.editing);
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const { handleEan } = useScanFlow();
  // Barcode scanning needs a camera pointed at a product — a touch device. Hide it on
  // desktop (fine pointer), where it's just a dead button.
  const canScan = useMediaQuery('(pointer: coarse)');
  // The inline detail panel replaces the modal on wide screens.
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Foods</h1>
        <div className="flex gap-2">
          {canScan ? (
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => setScanning(true)}
            >
              <Barcode className="size-4" />
              Scan
            </Button>
          ) : null}
          <Button type="button" className="h-11" onClick={openCreate}>
            <Plus className="size-4" />
            {/* On desktop this just clears the panel back to a blank "New food". */}
            {isDesktop ? 'New' : 'Add'}
          </Button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_28rem] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Search foods"
            className="h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="bg-card overflow-hidden rounded-xl border">
            <FoodList search={search} selectedId={isDesktop ? (editing?.id ?? null) : null} />
          </div>
        </div>
        {isDesktop ? <FoodDetailPanel /> : null}
      </div>

      {isDesktop ? null : <FoodSheet />}
      {canScan ? (
        <BarcodeScanner
          open={scanning}
          onClose={() => setScanning(false)}
          onDetected={(ean) => {
            setScanning(false);
            void handleEan(ean);
          }}
        />
      ) : null}
    </div>
  );
}
