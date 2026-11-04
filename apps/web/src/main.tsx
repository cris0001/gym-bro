import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/app';
import { registerMutationDefaults } from './app/mutation-defaults';
import { queryClient } from './lib/query-client';
import { restoreQueryCache } from './lib/query-persistence';
import './globals.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}
const root = createRoot(rootElement);

// Order matters: queued offline writes are restored with the cache and resumed right
// away, so their mutationFns must be registered first; and the app renders only after
// the restore, so the router's auth check sees the cached user (offline cold start).
registerMutationDefaults(queryClient);
void restoreQueryCache(queryClient).finally(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
