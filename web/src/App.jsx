import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import ShoppingList from './pages/ShoppingList';
import Recipes from './pages/Recipes';
import FloatingDock from './components/FloatingDock.jsx';

function App() {
  return (
    <div data-theme="fieldstone" className="min-h-screen bg-netural text-base-content"
      style={{
        backgroundImage: `url('/src/assets/dan-gold-4_jhDO54BYg-unsplash.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      >
      <Router>
        <main className="p-4 pb-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/recipes" element={<Recipes />} />
          </Routes>
        </main>
        <FloatingDock />
      </Router>
    </div>
  );
}

export default App;