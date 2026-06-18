import { serve } from '@hono/node-server';

import { app } from './app';
import { env } from './lib/env';

// Server bootstrap: the only place that binds a port. Importing `env` here
// validates the environment before we start listening (fail fast on misconfig).
serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
