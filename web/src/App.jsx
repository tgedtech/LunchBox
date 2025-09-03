import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ExpiredInventoryPage from './pages/ExpiredReport.jsx';
import Inventory from './pages/Inventory';
import ShoppingList from './pages/ShoppingList';
import Recipes from './pages/Recipes';
import RecipeNew from './pages/RecipeNew.jsx';
import Settings from './pages/Settings';
import ManageProducts from './pages/masterdata/ManageProducts';
import ManageCategories from './pages/masterdata/ManageCategories';
import ManageLocations from './pages/masterdata/ManageLocations';
import ManageUnits from './pages/masterdata/ManageUnits';
import ManageStores from './pages/masterdata/ManageStores';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthProvider';
import { ExpiredItemsProvider } from './context/ExpiredItemsContext';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/new" element={<RecipeNew />} />
        <Route path="/expired-report" element={<ExpiredInventoryPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/products" element={<ManageProducts />} />
        <Route path="/settings/categories" element={<ManageCategories />} />
        <Route path="/settings/locations" element={<ManageLocations />} />
        <Route path="/settings/units" element={<ManageUnits />} />
        <Route path="/settings/stores" element={<ManageStores />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ExpiredItemsProvider>
        <div data-theme="coseli" className="min-h-screen bg-base-100 text-base-content">
          <Router>
            <AppRoutes />
          </Router>
        </div>
      </ExpiredItemsProvider>
    </AuthProvider>
  );
}

export default App;