// Public interface of the nutrition feature — only page components are consumed
// elsewhere (mounted by the routes). Internals (api, hooks, stores, sub-
// components) stay private to the feature. Grown per slice.
export { FoodsPage } from './components/foods-page';
export { RecipesPage } from './components/recipes-page';
export { RecipeBuilder } from './components/recipe-builder';
export { RecipeEditPage } from './components/recipe-edit-page';
export { TargetsPage } from './components/targets-page';
