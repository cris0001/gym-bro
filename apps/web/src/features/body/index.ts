// Public interface of the body feature — only the page component is consumed
// elsewhere (mounted by the route). Internals (api, hooks, sub-components) stay
// private to the feature. Grown per slice.
export { BodyPage } from './components/body-page';

// Composed by the dashboard (the cross-module aggregation view).
export { useBodyMeasurements } from './hooks/use-body-measurements';
