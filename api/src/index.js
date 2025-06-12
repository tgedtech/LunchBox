import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import * as dotenv from 'dotenv';
import db from './db/index.js';
import { inventory_items } from './db/schema.js'; // Import schema correctly

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = Fastify({
  logger: true
});

// Register CORS
await app.register(fastifyCors, {
  origin: '*', // You can restrict this later to lunchbox.tged.tech
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

// Basic test route
app.get('/', async (request, reply) => {
  return { message: 'Hello from Lunchbox API!' };
});

// Health check route
app.get('/health', async (request, reply) => {
  try {
    // Run a simple test query to check DB connectivity
    const result = await db.select().from(inventory_items).limit(1);
    return {
      status: 'ok',
      dbConnected: true,
      inventoryCount: result.length
    };
  } catch (err) {
    return {
      status: 'error',
      dbConnected: false,
      error: err.message
    };
  }
});

// Start server
try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🚀 Lunchbox API running on http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}