import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FilterIcon from '../assets/icons/filter.svg?react';

function InventoryHeader({
  onAdd,
  itemCount,
  filters,
  setFilters,
  locations,
  categories,
  expirations,
  sortOptions,
  showExpiredItemsButton, // New prop (should be a button or null)
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

  return (
    <header className="w-full bg-secondary text-secondary-content shadow-lg flex items-center justify-between px-8" style={{ minHeight: '88px' }}>
        <h1 className="text-3xl font-quicksand font-bold">
          Inventory <span className="text-base font-normal text-secondary-content">({itemCount} items)</span>
        </h1>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-soft btn-primary items-center space-x-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="w-5 h-5" />
            <span className="font-nunito-sans font-bold">Filters</span>
          </button>
          {onAdd && (
            <button className="btn btn-primary btn-sm" onClick={onAdd}>
              + Add Item
            </button>
          )}
        </div>
      {showFilters && (
        <div className="mt-0 p-4 bg-secondary-content shadow space-y-3 border-t border-secondary">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name"
              className="input input-bordered input-sm w-48 text-primary"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            <select
              className="select select-bordered select-sm w-40 text-primary"
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm w-40 text-primary"
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm w-40 text-primary"
              value={filters.expiration}
              onChange={(e) => setFilters((prev) => ({ ...prev, expiration: e.target.value }))}
            >
              <option value="">All Expiration</option>
              {expirations.map((exp) => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm w-40 text-primary"
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
              className="btn btn-sm btn-soft btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

InventoryHeader.propTypes = {
  onAdd: PropTypes.func,
  itemCount: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  locations: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  expirations: PropTypes.array.isRequired,
  sortOptions: PropTypes.array.isRequired,
  showExpiredItemsButton: PropTypes.node, // Now optional node
};

export default InventoryHeader;