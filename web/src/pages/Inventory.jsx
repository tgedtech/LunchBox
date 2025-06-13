import React, { useState } from 'react';
import ConsumeIcon from '../assets/icons/inventory.consume1.svg?react';
import ConsumeAllIcon from '../assets/icons/inventory.consumeall.svg?react';
import OpenIcon from '../assets/icons/inventory.open1.svg?react';
import InventoryHeader from '../components/InventoryHeader';

function Inventory() {
  const inventoryItems = [
    {
      id: 1,
      name: 'Black Beans',
      quantity: '3 cans',
      location: 'Pantry',
      category: 'Canned Goods',
      expiration: 'Jul 15, 2025',
    },
    {
      id: 2,
      name: 'Chicken Breast',
      quantity: '4 lbs',
      location: 'Freezer',
      category: 'Meat',
      expiration: 'Jun 25, 2025',
    },
    {
      id: 3,
      name: 'Apples',
      quantity: '5',
      location: 'Fridge',
      category: 'Produce',
      expiration: 'None',
    },
  ];

  // Filters state
  const [filters, setFilters] = useState({
    name: '',
    location: '',
    category: '',
    expiration: '',
  });

  const [sortBy, setSortBy] = useState('');

  // Handle input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      name: '',
      location: '',
      category: '',
      expiration: '',
    });
  };

  // Filter logic
  const filteredItems = inventoryItems.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(filters.name.toLowerCase());
    const locationMatch = filters.location ? item.location === filters.location : true;
    const categoryMatch = filters.category ? item.category === filters.category : true;
    const expirationMatch =
      filters.expiration === 'Expired'
        ? new Date(item.expiration) < new Date()
        : filters.expiration === 'None'
        ? item.expiration === 'None'
        : true;

    return nameMatch && locationMatch && categoryMatch && expirationMatch;
  });

  // Sort logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'location':
        return a.location.localeCompare(b.location);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'expiration-newest':
        return new Date(b.expiration) - new Date(a.expiration);
      case 'expiration-oldest':
        return new Date(a.expiration) - new Date(b.expiration);
      default:
        return 0;
    }
  });

  return (
    <div className="p-4 pb-24">
      <InventoryHeader
        onAdd={() => console.log('Add new inventory item')}
        itemCount={inventoryItems.length}
        filteredCount={sortedItems.length}
      />

      {/* Filters */}
      <div className="bg-base-100 p-4 rounded-lg shadow mb-6 relative">
        <h2 className="text-lg font-semibold mb-2 text-primary">Filters</h2>

        <button
          className="absolute top-4 right-4 text-sm link link-secondary"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Search by name"
            className="input input-bordered w-full"
          />
          <select
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            className="select select-bordered w-full"
          >
            <option value="">All Locations</option>
            <option value="Pantry">Pantry</option>
            <option value="Freezer">Freezer</option>
            <option value="Fridge">Fridge</option>
          </select>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="select select-bordered w-full"
          >
            <option value="">All Categories</option>
            <option value="Canned Goods">Canned Goods</option>
            <option value="Meat">Meat</option>
            <option value="Produce">Produce</option>
          </select>
          <select
            name="expiration"
            value={filters.expiration}
            onChange={handleFilterChange}
            className="select select-bordered w-full"
          >
            <option value="">All Expiration</option>
            <option value="Expired">Expired</option>
            <option value="None">None</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="location">Location</option>
            <option value="category">Category</option>
            <option value="expiration-newest">Expiration (Newest First)</option>
            <option value="expiration-oldest">Expiration (Oldest First)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-base-100">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Category</th>
              <th>Expiration</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr
                key={item.id}
                className="transition-opacity duration-300 ease-in-out opacity-100"
              >
                <td className="flex space-x-2">
                  <button className="btn btn-xs btn-primary" onClick={() => console.log(`Consume 1 of ${item.name}`)}>
                    <ConsumeIcon className="w-4 h-4" />
                  </button>
                  <button className="btn btn-xs btn-error" onClick={() => console.log(`Consume ALL of ${item.name}`)}>
                    <ConsumeAllIcon className="w-4 h-4" />
                  </button>
                  <button className="btn btn-xs btn-secondary" onClick={() => console.log(`Open 1 of ${item.name}`)}>
                    <OpenIcon className="w-4 h-4" />
                  </button>
                </td>
                <td>
                  <a href="#" className="link link-primary" onClick={() => console.log(`Edit ${item.name}`)}>
                    {item.name}
                  </a>
                </td>
                <td>{item.quantity}</td>
                <td>{item.location}</td>
                <td>{item.category}</td>
                <td>
                  {item.expiration === 'None' ? (
                    <span className="text-gray-500">None</span>
                  ) : (
                    <span
                      className={`${
                        new Date(item.expiration) < new Date() ? 'text-error font-bold' : 'text-base-content'
                      }`}
                    >
                      {item.expiration}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;