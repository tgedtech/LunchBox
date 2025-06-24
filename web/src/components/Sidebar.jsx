import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const inSettings = location.pathname.startsWith('/settings');

  const linkClass = ({ isActive }) =>
    `font-quicksand font-bold ${isActive ? 'text-primary' : 'text-base-content'}`;

  return (
    <div className="bg-base-200 min-w-[14rem] p-4">
      <ul className="menu rounded-box w-full gap-y-2">
        <li>
          <h2 className="menu-title text-primary font-quicksand font-bold">Inventory</h2>
          <ul>
            <li><NavLink to="/inventory" className={linkClass}>My Pantry</NavLink></li>
            <li><NavLink to="/expired-report" className={linkClass}>Expired Inventory</NavLink></li>
          </ul>
        </li>
        <li>
          <NavLink to="/shopping-list" className={linkClass}>Shopping List</NavLink>
        </li>
        <li>
          <h2 className="menu-title text-primary font-quicksand font-bold">Cooking</h2>
          <ul>
            <li><NavLink to="/recipes" className={linkClass}>Recipes</NavLink></li>
            {/* Add meal planning if needed */}
          </ul>
        </li>
        <li>
          <h2 className="menu-title text-primary font-quicksand font-bold">Settings</h2>
          <ul>
            <li><NavLink to="/settings" className={linkClass}>Account Settings</NavLink></li>
            {inSettings && (
              <>
                <li><NavLink to="/settings/products" className={linkClass}>Manage Products</NavLink></li>
                <li><NavLink to="/settings/categories" className={linkClass}>Manage Categories</NavLink></li>
                <li><NavLink to="/settings/locations" className={linkClass}>Manage Locations</NavLink></li>
                <li><NavLink to="/settings/units" className={linkClass}>Manage Units</NavLink></li>
                <li><NavLink to="/settings/stores" className={linkClass}>Manage Stores</NavLink></li>
              </>
            )}
          </ul>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;