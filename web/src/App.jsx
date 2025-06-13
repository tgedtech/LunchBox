import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
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

function App() {
  return (
    <div data-theme="fieldstone" className="min-h-screen bg-neutral-content text-base-content">
      <Router>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/products" element={<ManageProducts />} />
            <Route path="/settings/categories" element={<ManageCategories />} />
            <Route path="/settings/locations" element={<ManageLocations />} />
            <Route path="/settings/units" element={<ManageUnits />} />
            <Route path="/settings/stores" element={<ManageStores />} />
          </Routes>
        </main>
        <FloatingDock />
      </Router>
    </div>
  );
}

export default App;