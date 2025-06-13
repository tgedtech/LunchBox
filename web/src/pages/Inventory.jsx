import React, { useEffect, useState } from 'react';
import { getInventory } from '../services/inventoryService';
import InventoryHeader from '../components/InventoryHeader';
import ConsumeIcon from '../assets/icons/inventory.consume1.svg?react';
import ConsumeAllIcon from '../assets/icons/inventory.consumeall.svg?react';
import OpenIcon from '../assets/icons/inventory.open1.svg?react';

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await getInventory();
      setInventoryItems(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24">
      <InventoryHeader
        onAdd={() => console.log('Add new inventory item')}
        itemCount={inventoryItems.length}
      />

      {loading ? (
        <p>Loading inventory...</p>
      ) : (
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
              {inventoryItems.map((item) => (
                <tr key={item.id}>
                  <td className="flex space-x-2">
                    <button className="btn btn-xs btn-primary" onClick={() => console.log(`Consume 1 of ${item.product.name}`)}>
                      <ConsumeIcon className="w-4 h-4" />
                    </button>
                    <button className="btn btn-xs btn-error" onClick={() => console.log(`Consume ALL of ${item.product.name}`)}>
                      <ConsumeAllIcon className="w-4 h-4" />
                    </button>
                    <button className="btn btn-xs btn-secondary" onClick={() => console.log(`Open 1 of ${item.product.name}`)}>
                      <OpenIcon className="w-4 h-4" />
                    </button>
                  </td>
                  <td>
                    <a href="#" className="link link-primary" onClick={() => console.log(`Edit ${item.product.name}`)}>
                      {item.product.name}
                    </a>
                  </td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>{item.location?.name || '-'}</td>
                  <td>{item.product.category?.name || '-'}</td>
                  <td>
                    {item.expiration ? (
                      <span
                        className={`${new Date(item.expiration) < new Date() ? 'text-error font-bold' : 'text-base-content'}`}
                      >
                        {new Date(item.expiration).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Inventory;