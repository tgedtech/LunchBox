import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

export default {
  schema: './src/db/schema.js',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      ca: fs.readFileSync('./do-ca-certificate.crt').toString(),
      rejectUnauthorized: true
    }
  }
} satisfies Config;