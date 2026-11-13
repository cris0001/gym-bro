import type {
  Food,
  FoodLogUnit,
  GlobalProduct,
  RecentDiaryItem,
  RecipeListItem,
} from '@gym-bro/shared';

// A portion to log: which unit and how many of it.
export interface Portion {
  unit: FoodLogUnit;
  quantity: number;
}

// One row in the add-entry results list — a food, a recipe, or a catalog product not in
// your foods yet — resolved with the bits the row needs to render (photo, meta line)
// and to log (the source object + its last-used portion for a one-tap add). A catalog
// row is copied into your foods on first log, then logged like any food.
export type AddEntryRow =
  | {
      kind: 'catalog';
      id: string;
      name: string;
      imageUrl: string | null;
      meta: string;
      isRecent: false;
      product: GlobalProduct;
      lastUsed: null;
    }
  | {
      kind: 'food';
      id: string;
      name: string;
      imageUrl: string | null;
      meta: string;
      isRecent: boolean;
      food: Food;
      lastUsed: Portion | null;
    }
  | {
      kind: 'recipe';
      id: string;
      name: string;
      imageUrl: string | null;
      meta: string;
      isRecent: boolean;
      recipe: RecipeListItem;
      lastUsed: Portion | null;
    };

// Trim a macro number to at most one decimal, dropping a trailing ".0" — matches the
// mock ("P 12", "C 0.7", "C 3.5").
function fmtMacro(n: number): string {
  return String(Number(n.toFixed(1)));
}

// The meta line under a name. A food (or catalog product) describes a 100 g portion
// (its stored per-100g macros); a recipe describes one serving (its per-serving macros).
function foodMeta(food: Food | GlobalProduct): string {
  return `100 g · ${Math.round(food.kcal)} kcal · P ${fmtMacro(food.proteinG)} · C ${fmtMacro(
    food.carbsG,
  )} · F ${fmtMacro(food.fatG)}`;
}

function recipeMeta(recipe: RecipeListItem): string {
  const m = recipe.perServing;
  return `1 serv · ${Math.round(m.kcal)} kcal · P ${fmtMacro(m.proteinG)} · C ${fmtMacro(
    m.carbsG,
  )} · F ${fmtMacro(m.fatG)}`;
}

function foodRow(food: Food, isRecent: boolean, lastUsed: Portion | null): AddEntryRow {
  return {
    kind: 'food',
    id: food.id,
    name: food.name,
    imageUrl: food.imageUrl,
    meta: foodMeta(food),
    isRecent,
    food,
    lastUsed,
  };
}

function recipeRow(
  recipe: RecipeListItem,
  isRecent: boolean,
  lastUsed: Portion | null,
): AddEntryRow {
  return {
    kind: 'recipe',
    id: recipe.id,
    name: recipe.name,
    imageUrl: recipe.imageUrl,
    meta: recipeMeta(recipe),
    isRecent,
    recipe,
    lastUsed,
  };
}

// `name` is the catalog display name (UI language / brand-prefixed), resolved by the
// caller.
export function catalogRow(product: GlobalProduct, name: string): AddEntryRow {
  return {
    kind: 'catalog',
    id: product.id,
    name,
    imageUrl: product.imageUrl,
    meta: foodMeta(product),
    isRecent: false,
    product,
    lastUsed: null,
  };
}

// A portion as the short label the add pill and a pending diary row show ("120 g",
// "1 serv"), with the unit abbreviations of the active locale.
export function portionLabel(portion: Portion, unitShort: Record<FoodLogUnit, string>): string {
  return `${Number(portion.quantity.toFixed(2))} ${unitShort[portion.unit]}`;
}

// The default portion to log on a one-tap "+": the portion this item was last logged at
// (from the recent list), else one serving when it has one, else 100 g.
export function defaultPortion(row: AddEntryRow): Portion {
  if (row.lastUsed) return row.lastUsed;
  if (row.kind === 'recipe') return { unit: 'servings', quantity: 1 };
  const source = row.kind === 'food' ? row.food : row.product;
  return source.servingGrams !== null
    ? { unit: 'servings', quantity: 1 }
    : { unit: 'grams', quantity: 100 };
}

// Build the results list. With an empty query: the meal's recently-used items first
// (badged, in recency order), then the rest of the dictionary alphabetically. While
// typing: a flat, unbadged name filter over foods + recipes, followed by the catalog
// rows (already searched server-side) for products you don't have yet.
export function buildAddEntryList(
  foods: Food[],
  recipes: RecipeListItem[],
  recent: RecentDiaryItem[],
  query: string,
  catalog: AddEntryRow[] = [],
): AddEntryRow[] {
  const q = query.trim().toLowerCase();

  if (q) {
    const rows = [
      ...foods.filter((f) => f.name.toLowerCase().includes(q)).map((f) => foodRow(f, false, null)),
      ...recipes
        .filter((r) => r.name.toLowerCase().includes(q))
        .map((r) => recipeRow(r, false, null)),
    ];
    const owned = new Set(foods.map((f) => f.globalProductId));
    const fromCatalog = catalog.filter((row) => !owned.has(row.id));
    return [...rows.sort((a, b) => a.name.localeCompare(b.name)), ...fromCatalog];
  }

  const foodById = new Map(foods.map((f) => [f.id, f]));
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const usedIds = new Set<string>();

  const recentRows: AddEntryRow[] = [];
  for (const item of recent) {
    const portion: Portion = { unit: item.unit, quantity: item.quantity };
    if (item.type === 'food') {
      const food = foodById.get(item.id);
      if (food && !usedIds.has(food.id)) {
        recentRows.push(foodRow(food, true, portion));
        usedIds.add(food.id);
      }
    } else {
      const recipe = recipeById.get(item.id);
      if (recipe && !usedIds.has(recipe.id)) {
        recentRows.push(recipeRow(recipe, true, portion));
        usedIds.add(recipe.id);
      }
    }
  }

  const rest: AddEntryRow[] = [
    ...foods.filter((f) => !usedIds.has(f.id)).map((f) => foodRow(f, false, null)),
    ...recipes.filter((r) => !usedIds.has(r.id)).map((r) => recipeRow(r, false, null)),
  ].sort((a, b) => a.name.localeCompare(b.name));

  return [...recentRows, ...rest];
}
