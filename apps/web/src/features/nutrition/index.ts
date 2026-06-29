// Public interface of the nutrition feature — only page components are consumed
// elsewhere (mounted by the routes). Internals (api, hooks, stores, sub-
// components) stay private to the feature. Grown per slice, foods first.
export { FoodsPage } from './components/foods-page';
