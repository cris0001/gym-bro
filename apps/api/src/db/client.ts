import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

import { env } from '../lib/env';

// WebSocket Pool driver (not neon-http): the API is a long-running server, so
// we want a connection pool and real interactive transactions for atomic
// multi-row writes (e.g. a workout session together with its sets).
const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle({ client: pool });
