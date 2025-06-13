import React, { useState } from 'react';
import FilterIcon from '../assets/icons/filter.svg?react';
import LogOutIcon from '../assets/icons/logout.svg?react';

function InventoryHeader({
  onAdd,
  itemCount,
  filters,
  setFilters,
  locations,
  categories,
  expirations,
  sortOptions,
}) {
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      category: '',
      expiration: '',
      sortBy: '',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="mb-6 px-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-quicksand font-bold text-primary mb-1">
            Inventory <span className="text-base-content text-base font-normal">({itemCount} items)</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="btn btn-sm btn-ghost text-base-content hover:text-primary flex items-center space-x-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="w-5 h-5 text-error" />
            <span>Filters</span>
          </button>
          {onAdd && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onAdd}
            >
              + Add Item
            </button>
          )}
          <button
            className="btn btn-sm btn-ghost text-base-content hover:text-primary flex items-center space-x-1"
            onClick={handleLogout}
          >
            <LogOutIcon className="w-5 h-5 text-error" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-base-200 rounded-lg shadow space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name"
              className="input input-bordered input-sm w-48"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            <select
              className="select select-bordered select-sm w-40"
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm w-40"
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm w-40"
              value={filters.expiration}
              onChange={(e) => setFilters((prev) => ({ ...prev, expiration: e.target.value }))}
            >
              <option value="">All Expiration</option>
              {expirations.map((exp) => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm w-40"
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            >
              <option value="">Sort By</option>
              {sortOptions.map((sort) => (
                <option key={sort} value={sort}>{sort}</option>
              ))}
            </select>
          </div>

          <div className="text-right">
            <button
              className="text-sm text-error hover:underline"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryHeader;