import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import meRoute from './routes/me.js';
import inventoryRoutes from './routes/inventory.js';
import productsRoutes from './routes/products.js';
import locationsRoutes from './routes/locations.js';
import categoriesRoutes from './routes/categories.js';

dotenv.config();   // Load env variables first

const app = express();
app.use(cors());
app.use(express.json());
app.use('/products', productsRoutes);
app.use('/locations', locationsRoutes);
app.use('/categories', categoriesRoutes);

// Routes
app.use('/auth', authRoutes);
app.use('/me', meRoute);
app.use('/inventory', inventoryRoutes);   // <-- Move here!

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});