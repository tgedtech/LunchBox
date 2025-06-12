import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar2.jsx';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import ShoppingList from './pages/ShoppingList';
import Recipes from './pages/Recipes';

function App() {
  return (
    <div data-theme="fieldstone" className="min-h-screen bg-neutral-content text-base-content">
      <Router>
        <NavBar />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/recipes" element={<Recipes />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;