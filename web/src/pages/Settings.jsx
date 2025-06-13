import React from 'react';
import { Link } from 'react-router-dom';
import MasterDataHeader from '../components/MasterDataHeader';

function Settings() {
  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Settings" />

      <div className="space-y-4">
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Master Data</h2>
          <div className="flex flex-col space-y-2">
            <Link to="/settings/products" className="link link-primary">Manage Products</Link>
            <Link to="/settings/categories" className="link link-primary">Manage Categories</Link>
            <Link to="/settings/locations" className="link link-primary">Manage Locations</Link>
            <Link to="/settings/units" className="link link-primary">Manage Units</Link>
            <Link to="/settings/stores" className="link link-primary">Manage Stores</Link>
          </div>
        </div>

        {/* Placeholder for future settings sections */}
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">User Settings</h2>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default Settings;