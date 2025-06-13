import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '../assets/icons/home.svg?react';
import RecipesIcon from '../assets/icons/books.vertical 1.svg?react';
import InventoryIcon from '../assets/icons/shippingbox 1.svg?react';
import ShoppingListIcon from '../assets/icons/cart 1.svg?react';
import SettingsIcon from '../assets/icons/settings.svg?react';
import useAuth from '../hooks/useAuth';

const FloatingDock = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navLinkClass =
    'flex flex-col items-center transition-colors duration-200 text-base-content hover:text-primary';

  const activeClass = 'text-primary font-semibold';

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-between w-[90%] max-w-md px-4 py-2 rounded-2xl shadow-[var(--glass-shadow)] backdrop-blur-md backdrop-saturate-[var(--glass-saturate)] border"
      style={{
        backgroundColor: 'var(--glass-bg-light)',
        borderColor: 'var(--glass-border-light)',
      }}
    >
      <NavLink to="/" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : ''}`}>
        <HomeIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Home</span>
      </NavLink>
      <NavLink to="/recipes" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : ''}`}>
        <RecipesIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Recipes</span>
      </NavLink>
      <NavLink to="/inventory" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : ''}`}>
        <InventoryIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Inventory</span>
      </NavLink>
      <NavLink to="/shopping-list" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : ''}`}>
        <ShoppingListIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Shop</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : ''}`}>
        <SettingsIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Settings</span>
      </NavLink>
    </div>
  );
};

export default FloatingDock;