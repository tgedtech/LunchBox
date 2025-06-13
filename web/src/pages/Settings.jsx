import React from 'react';
import { Link } from 'react-router-dom';

function Settings() {
  return (
    <div className="p-4 pb-24">
      <h1 className="text-3xl font-quicksand font-bold text-primary mb-6">Settings</h1>

      <h2 className="text-xl font-semibold mb-2">Manage Master Data</h2>
      <ul className="menu bg-base-100 rounded-box p-2 shadow w-80 mb-6">
        <li><Link to="/settings/products">Manage Products</Link></li>
        <li><Link to="/settings/categories">Manage Categories</Link></li>
        <li><Link to="/settings/locations">Manage Locations</Link></li>
        <li><Link to="/settings/units">Manage Units</Link></li>
        <li><Link to="/settings/stores">Manage Stores</Link></li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Other Settings (Coming Soon)</h2>
      <div className="text-gray-500">User Settings, Preferences, etc.</div>
    </div>
  );
}

export default Settings;