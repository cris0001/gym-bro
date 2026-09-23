import { Apple, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteIconButton } from '@/components/delete-icon-button';
import { EmptyState } from '@/components/empty-state';
import { SkeletonList } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/stores/confirm.store';

import type { Food } from '@gym-bro/shared';

import { useDeleteFood } from '../hooks/use-delete-food';
import { useFoods } from '../hooks/use-foods';
import { useNutritionTranslation } from '../i18n';
import { useFoodUiStore } from '../stores/food-ui.store';
import { MacroValues } from './macro-values';

// Desktop table track: name | kcal | P | C | F | delete (32px button + 8px gap). The
// header uses it directly; rows split it between the row button and the delete.
const TABLE_COLUMNS = 'grid-cols-[minmax(0,1fr)_64px_52px_52px_52px_40px]';

interface FoodListProps {
  search: string;
  // The row currently loaded in the desktop detail panel — highlighted. Null/absent on
  // mobile, where the row opens a sheet instead.
  selectedId?: string | null;
}

// The food dictionary list. Fetches the full dictionary once and filters by name
// client-side (a personal list is small; avoids a request per keystroke). Each
// row shows the per-100g macros; tapping it opens the edit sheet, delete confirms.
export function FoodList({ search, selectedId = null }: FoodListProps) {
  const t = useNutritionTranslation();
  const { data: foods = [], isPending } = useFoods('');
  const openEdit = useFoodUiStore((s) => s.openEdit);
  const openCreate = useFoodUiStore((s) => s.openCreate);
  const remove = useDeleteFood();
  const confirm = useConfirm();

  const query = search.trim().toLowerCase();
  const filtered = query ? foods.filter((f) => f.name.toLowerCase().includes(query)) : foods;

  async function onDelete(food: Food) {
    const ok = await confirm({
      title: t.foods.deleteConfirm.title(food.name),
      description: t.foods.deleteConfirm.description,
      confirmText: t.common.delete,
      destructive: true,
    });
    if (ok) remove.mutate(food.id, { onSuccess: () => toast.success(t.foods.foodDeleted) });
  }

  if (isPending) {
    return <SkeletonList avatar avatarClassName="size-[46px] rounded-xl" />;
  }
  if (filtered.length === 0) {
    if (query) {
      return (
        <EmptyState title={t.foods.noMatches} description={t.foods.noMatchesDesc(search.trim())} />
      );
    }
    return (
      <EmptyState
        icon={<Apple className="size-6" />}
        title={t.foods.emptyTitle}
        description={t.foods.emptyDesc}
        action={
          <Button type="button" className="h-11 rounded-full px-5" onClick={openCreate}>
            <Plus className="size-4" />
            {t.foods.addFood}
          </Button>
        }
      />
    );
  }

  // Below 1280px each food is its own bordered card (one column on phones, two from
  // 768px) so rows never blur together. 1280px+: a table (column header + aligned
  // kcal/P/C/F cells) sitting next to the detail panel.
  return (
    <div>
      <div
        className={cn(
          TABLE_COLUMNS,
          'text-muted-foreground hidden border-b border-border py-3 pr-2 pl-3.5 text-[10.5px] font-bold tracking-[0.08em] uppercase xl:grid',
        )}
      >
        <span className="pl-14">{t.common.name}</span>
        <span className="text-right">kcal</span>
        <span className="text-right text-[#8d4a5e]">{t.common.macroShort.protein}</span>
        <span className="text-right text-[#b8862a]">{t.common.macroShort.carbs}</span>
        <span className="text-right text-[#5a7a52]">{t.common.macroShort.fat}</span>
        <span aria-hidden />
      </div>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-3 xl:block">
        {filtered.map((food) => {
          const selected = food.id === selectedId;
          return (
            <li
              key={food.id}
              className={cn(
                'bg-card border-border flex items-center gap-2 rounded-2xl border py-3 pr-2 pl-3.5 transition-colors hover:border-border-strong',
                'xl:hover:bg-muted/50 xl:rounded-none xl:border-x-0 xl:border-t-0 xl:border-b xl:border-border xl:bg-transparent xl:py-3 xl:last:border-b-0',
                selected && 'bg-accent xl:bg-accent xl:hover:bg-accent',
              )}
            >
              <button
                type="button"
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-3 text-left',
                  'xl:grid xl:grid-cols-[minmax(0,1fr)_64px_52px_52px_52px] xl:gap-0',
                )}
                aria-label={t.foods.editAria(food.name)}
                onClick={() => openEdit(food)}
              >
                <span className="flex min-w-0 items-center gap-3">
                  {food.imageUrl ? (
                    <img
                      src={food.imageUrl}
                      alt=""
                      className="bg-muted size-[46px] shrink-0 rounded-xl object-cover xl:size-11"
                    />
                  ) : (
                    <span className="bg-muted flex size-[46px] shrink-0 items-center justify-center rounded-xl text-muted-foreground xl:size-11">
                      <Apple className="size-5" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'font-heading block truncate text-[16.5px] leading-tight font-medium xl:text-base',
                        selected && 'xl:text-accent-foreground',
                      )}
                    >
                      {food.name}
                    </span>
                    {/* Compact macro line — below 1280px, where there are no columns. */}
                    <span className="mt-0.5 flex items-center gap-2.5 text-[11.5px] text-[#7a6c72] xl:hidden dark:text-[#9c9097]">
                      <span className="text-foreground font-bold">{food.kcal} kcal</span>
                      <MacroValues protein={food.proteinG} carbs={food.carbsG} fat={food.fatG} />
                    </span>
                  </span>
                </span>
                <span className="hidden text-right text-[13.5px] font-bold xl:block">
                  {food.kcal}
                </span>
                {[food.proteinG, food.carbsG, food.fatG].map((value, i) => (
                  <span
                    key={i}
                    className="hidden text-right text-[13px] text-subtle-foreground xl:block"
                  >
                    {value}
                  </span>
                ))}
              </button>
              <DeleteIconButton
                className="mr-2 xl:mr-0"
                aria-label={t.foods.deleteAria(food.name)}
                disabled={remove.isPending}
                onClick={() => void onDelete(food)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
