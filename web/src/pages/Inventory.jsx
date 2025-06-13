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

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    expiration: '',
    sortBy: '',
  });

  const locations = [...new Set(inventoryItems.map(item => item.location))];
  const categories = [...new Set(inventoryItems.map(item => item.category))];
  const expirations = ['None', 'Expired', 'Valid']; // Example values
  const sortOptions = ['Name A-Z', 'Name Z-A', 'Expiring Soon'];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesLocation = filters.location ? item.location === filters.location : true;
    const matchesCategory = filters.category ? item.category === filters.category : true;
    const matchesExpiration =
      filters.expiration === 'None'
        ? item.expiration === 'None'
        : filters.expiration === 'Expired'
          ? item.expiration !== 'None' && new Date(item.expiration) < new Date()
          : filters.expiration === 'Valid'
            ? item.expiration !== 'None' && new Date(item.expiration) >= new Date()
            : true;

    return matchesSearch && matchesLocation && matchesCategory && matchesExpiration;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (filters.sortBy === 'Name A-Z') return a.name.localeCompare(b.name);
    if (filters.sortBy === 'Name Z-A') return b.name.localeCompare(a.name);
    if (filters.sortBy === 'Expiring Soon') {
      const aDate = a.expiration === 'None' ? Infinity : new Date(a.expiration);
      const bDate = b.expiration === 'None' ? Infinity : new Date(b.expiration);
      return aDate - bDate;
    }
    return 0;
  });

  return (
    <div className="p-4 pb-24">
      <InventoryHeader
        onAdd={() => console.log('Add new inventory item')}
        itemCount={filteredItems.length}
        filters={filters}
        setFilters={setFilters}
        locations={locations}
        categories={categories}
        expirations={expirations}
        sortOptions={sortOptions}
      />

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
              <tr key={item.id}>
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