import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ExpiredInventoryPage from './pages/ExpiredReport.jsx';
import Inventory from './pages/Inventory';
import ShoppingList from './pages/ShoppingList';
import Recipes from './pages/Recipes';
import Settings from './pages/Settings';
import ManageProducts from './pages/masterdata/ManageProducts';
import ManageCategories from './pages/masterdata/ManageCategories';
import ManageLocations from './pages/masterdata/ManageLocations';
import ManageUnits from './pages/masterdata/ManageUnits';
import ManageStores from './pages/masterdata/ManageStores';
import FloatingDock from './components/FloatingDock.jsx';
import { AuthProvider } from './context/AuthProvider';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const location = useLocation();
  const hideDock = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      <main className="w-full min-h-screen bg-base-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ExpiredInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <ProtectedRoute>
                <ShoppingList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <Recipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/products"
            element={
              <ProtectedRoute>
                <ManageProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/categories"
            element={
              <ProtectedRoute>
                <ManageCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/locations"
            element={
              <ProtectedRoute>
                <ManageLocations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/units"
            element={
              <ProtectedRoute>
                <ManageUnits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/stores"
            element={
              <ProtectedRoute>
                <ManageStores />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {/* Only show dock when NOT on login/register */}
      {!hideDock && <FloatingDock />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <div data-theme="fieldstone" className="min-h-screen bg-base-100 text-base-content">
        <Router>
          <AppRoutes />
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;