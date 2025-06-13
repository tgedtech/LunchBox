import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import ShoppingList from './pages/ShoppingList';
import Recipes from './pages/Recipes';
import FloatingDock from './components/FloatingDock.jsx';

function App() {
  const [pageAddOverride, setPageAddOverride] = useState(null);

  const handleAddAction = (path) => {
    console.log('Default App-level Add action:', path);
    // fallback behavior, if page doesn't override it
  };

  return (
    <div data-theme="fieldstone" className="min-h-screen bg-neutral-content text-base-content">
      <Router>
        <main className="p-4">
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
            <Route
              path="/inventory"
              element={
                <Inventory
                  setPageAddOverride={setPageAddOverride}
                />
              }
            />
            <Route
              path="/shopping-list"
              element={<ShoppingList />}
            />
            <Route
              path="/recipes"
              element={<Recipes />}
            />
          </Routes>
        </main>
        <FloatingDock
          onAddAction={handleAddAction}
          pageAddOverride={pageAddOverride}
        />
      </Router>
    </div>
  );
}

export default App;