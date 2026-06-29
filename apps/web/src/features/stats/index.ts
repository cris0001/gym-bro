// Public interface of the stats feature — only StatsPage is consumed elsewhere
// (mounted by the /stats route). Internals (api, hooks, chart components) stay
// private to the feature.
export { StatsPage } from './components/stats-page';
