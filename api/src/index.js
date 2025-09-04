import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import meRoute from './routes/me.js';
import inventoryRoutes from './routes/inventory.js';
import productsRoutes from './routes/products.js';
import locationsRoutes from './routes/locations.js';
import categoriesRoutes from './routes/categories.js';
import storesRoutes from './routes/stores.js';
import unitsRoutes from './routes/units.js';
import shoppingListRoutes from './routes/shoppingList.js';
import recipesRoutes from './routes/recipes.js';

dotenv.config();   // Load env variables first

const app = express();
app.use(cors());
app.use(express.json());
app.use('/products', productsRoutes);
app.use('/locations', locationsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/stores', storesRoutes);
app.use('/units', unitsRoutes);
app.use('/recipes', recipesRoutes);

// Routes
app.use('/auth', authRoutes);
app.use('/me', meRoute);
app.use('/inventory', inventoryRoutes); 
app.use('/shopping-list', shoppingListRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});