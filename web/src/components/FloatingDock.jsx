import React from 'react';
import { NavLink } from 'react-router-dom';
import RecipesIcon from '../assets/icons/books.vertical 1.svg?react';
import InventoryIcon from '../assets/icons/shippingbox 1.svg?react';
import ShoppingListIcon from '../assets/icons/cart 1.svg?react';
import ExpiredIcon from '../assets/icons/expired.svg?react';
import SettingsIcon from '../assets/icons/settings.svg?react';
import { useExpiredItems } from '../context/ExpiredItemsContext';

const FloatingDock = () => {
  const { expiredCount } = useExpiredItems();

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
      <NavLink to="/recipes" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : ''}`}>
        <RecipesIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Recipes</span>
      </NavLink>
      <NavLink to="/inventory" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : ''}`}>
        <InventoryIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Inventory</span>
      </NavLink>
      {expiredCount > 0 && (
        <NavLink to="/expired-report" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : ''}`}>
          <ExpiredIcon className="w-6 h-6 mb-1" />
          <span className="text-xs">Expired Items</span>
        </NavLink>
      )}
      <NavLink to="/shopping-list" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : ''}`}>
        <ShoppingListIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Shopping List</span>
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `${navLinkClass} ${isActive ? activeClass : ''}`}>
        <SettingsIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Settings</span>
      </NavLink>
    </div>
  );
};

export default FloatingDock;