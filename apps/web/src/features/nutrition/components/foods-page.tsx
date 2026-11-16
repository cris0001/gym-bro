import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PageTitle } from '@/components/page-title';
import { FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import { useNutritionTranslation } from '../i18n';
import { useFoodUiStore } from '../stores/food-ui.store';
import { FoodDetailPanel } from './food-detail-panel';
import { FoodList } from './food-list';
import { FoodSheet } from './food-sheet';
import { MacroLegend } from './macro-legend';

// The food dictionary page. Mobile: a single column (search + list) with a bottom-sheet
// create/edit form. Desktop (lg+): a master-detail layout — the list on the left, an
// always-visible form panel on the right (blank by default, a selected row loads it for
// editing). Scanning (touch devices) lives in the add sheet's "Scan barcode" tab.
export function FoodsPage() {
  const t = useNutritionTranslation();
  const openCreate = useFoodUiStore((s) => s.openCreate);
  const editing = useFoodUiStore((s) => s.editing);
  const [search, setSearch] = useState('');
  // The inline detail panel replaces the modal on wide screens.
  const isDesktop = useMediaQuery('(min-width: 1280px)');

  return (
    <div className="lg:col-start-2 flex w-full max-w-6xl flex-col gap-4 p-3 md:p-4">
      <div className="flex items-center justify-between gap-2">
        <PageTitle className="font-heading text-[28px] leading-none font-bold tracking-tight xl:text-[30px]">
          {t.foods.title}
        </PageTitle>
        <div className="flex gap-2">
          <Button
            type="button"
            className="h-9.5 rounded-full px-5 text-[14px] font-semibold"
            onClick={openCreate}
          >
            <Plus className="size-4" />
            {/* On desktop this just clears the panel back to a blank "New food". */}
            {isDesktop ? t.foods.new : t.common.add}
          </Button>
        </div>
      </div>

      {/* minmax(0,1fr): the list column may shrink below its content (names truncate)
          instead of pushing the page into a horizontal scroll next to the 28rem panel. */}
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_28rem] xl:items-start xl:gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <Input
              placeholder={t.foods.searchFoods}
              className={cn(FIELD_CLASS, 'pl-10')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-muted-foreground text-[12.5px]">{t.foods.macrosPer100g}</p>
            <MacroLegend className="xl:hidden" />
          </div>
          {/* Below xl the rows are their own cards and the page scrolls; at xl the
              table sits in one card next to the panel, capped to the viewport (15rem ≈
              page header + search above it) so only its rows scroll. */}
          <div className="xl:border-border xl:bg-card xl:flex xl:max-h-[calc(100dvh-15rem)] xl:min-h-80 xl:flex-col xl:overflow-hidden xl:rounded-xl xl:border">
            <FoodList search={search} selectedId={isDesktop ? (editing?.id ?? null) : null} />
          </div>
        </div>
        {isDesktop ? <FoodDetailPanel /> : null}
      </div>

      {isDesktop ? null : <FoodSheet />}
    </div>
  );
}
