import React, { useEffect, useState } from 'react';
import ConsumeIcon from '../assets/icons/minus.rectangle.svg?react';
import ConsumeAllIcon from '../assets/icons/inventory.consumeall.svg?react';
import AddtoShoppingList from '../assets/icons/cart 1.svg?react';
import OpenIcon from '../assets/icons/inventory.open1.svg?react';
import InventoryHeader from '../components/InventoryHeader';
import AddItemModal from '../components/inventory/AddItemModal';
import axios from '../utils/axiosInstance';

function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stores, setStores] = useState([]);
  const [units, setUnits] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    expiration: '',
    sortBy: '',
  });

  const [showModal, setShowModal] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/inventory');
      setInventoryItems(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [productsRes, categoriesRes, locationsRes, storesRes, unitsRes] = await Promise.all([
        axios.get('/products'),
        axios.get('/categories'),
        axios.get('/locations'),
        axios.get('/stores'),
        axios.get('/units'),
      ]);

      setProducts(productsRes.data);
      setCategories(categoriesRes.data.map((c) => c.name));
      setLocations(locationsRes.data.map((l) => l.name));
      setStores(storesRes.data.map((s) => s.name));
      setUnits(unitsRes.data.map((u) => u.name));
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchMasterData();
  }, []);

  const handleAddClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalSuccess = () => {
    fetchInventory();
    setShowModal(false);
  };

  const filterInventory = (items) => {
    return items
      .filter((item) => {
        // Search
        const matchesSearch = item.product?.name
          .toLowerCase()
          .includes(filters.search.toLowerCase());

        // Location
        const matchesLocation =
          !filters.location || item.location?.name === filters.location;

        // Category
        const matchesCategory =
          !filters.category || item.product?.category?.name === filters.category;

        // Expiration
        const now = new Date();
        const expDate = item.expiration ? new Date(item.expiration) : null;

        let matchesExpiration = true;
        if (filters.expiration === 'Expired') {
          matchesExpiration = expDate && expDate < now;
        } else if (filters.expiration === 'Expiring Soon') {
          const soon = new Date();
          soon.setDate(soon.getDate() + 7);
          matchesExpiration = expDate && expDate >= now && expDate <= soon;
        } else if (filters.expiration === 'Valid') {
          matchesExpiration = !expDate || expDate > now;
        }

        return (
          matchesSearch &&
          matchesLocation &&
          matchesCategory &&
          matchesExpiration
        );
      })
      .sort((a, b) => {
        if (filters.sortBy === 'Name') {
          return a.product?.name.localeCompare(b.product?.name);
        }
        if (filters.sortBy === 'Quantity') {
          return b.quantity - a.quantity;
        }
        if (filters.sortBy === 'Expiration') {
          const aExp = a.expiration ? new Date(a.expiration) : new Date(9999, 11, 31);
          const bExp = b.expiration ? new Date(b.expiration) : new Date(9999, 11, 31);
          return aExp - bExp;
        }
        return 0;
      });
  };

  return (
    <div className="p-4 pb-24">
      <InventoryHeader
        onAdd={handleAddClick}
        itemCount={inventoryItems.length}
        filters={filters}
        setFilters={setFilters}
        locations={locations}
        categories={categories}
        expirations={['Expired', 'Expiring Soon', 'Valid']}
        sortOptions={['Name', 'Quantity', 'Expiration']}
      />

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-base-100 font-nunito-sans">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Location</th>
              <th>Category</th>
              <th>Soonest Expiration</th>
            </tr>
          </thead>
          <tbody>
            {filterInventory(inventoryItems).map((item) => (
              <tr key={item.id}>
                <td className="flex space-x-2">
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => console.log(`Consume 1 of ${item.product.name}`)}
                  >
                    <ConsumeIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-xs btn-accent"
                    onClick={() => console.log(`Consume ALL of ${item.product.name}`)}
                  >
                    <AddtoShoppingList className="w-4 h-4" />
                  </button>
                </td>
                <td>
                  <a
                    href="#"
                    className="link link-primary"
                    onClick={() => console.log(`Edit ${item.product.name}`)}
                  >
                    {item.product?.name}
                  </a>
                </td>
                <td>
                  {item.quantity} {item.unit}
                </td>
                <td>{item.location?.name}</td>
                <td>{item.product?.category?.name || 'Uncategorized'}</td>
                <td>
                  {item.expiration ? (
                    <span
                      className={`${
                        new Date(item.expiration) < new Date()
                          ? 'text-error font-bold'
                          : 'text-base-content'
                      }`}
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

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        products={products}
        categories={categories.map((c) => ({ id: c, name: c }))}
        locations={locations.map((l) => ({ id: l, name: l }))}
        stores={stores.map((s) => ({ id: s, name: s }))}
        units={units.map((u) => ({ id: u, name: u }))}
      />
    </div>
  );
}

export default Inventory;