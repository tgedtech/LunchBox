import React, { useEffect, useState } from 'react';
import OpenIcon from '../assets/icons/inventory.open1.svg?react';
import RemoveIcon from '../assets/icons/minus.rectangle.svg?react';
import CartIcon from '../assets/icons/cart 1.svg?react';
import InventoryHeader from '../components/InventoryHeader';
import AddItemModal from '../components/inventory/AddItemModal';
import ActionModal from '../components/inventory/ActionModal';
import axios from '../utils/axiosInstance';

const CATEGORY_LABELS = {
  1: "Consumed when opened",
  2: "Long lasting after open",
  3: "Goes bad after open"
};

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

  // Always initialize modal state as CLOSED (open: false)
  const [actionModal, setActionModal] = useState({
    open: false,
    actionType: null,
    item: null,
    maxQuantity: 1,
    isExpired: false,
    askAddToList: false,
  });

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
      setCategories(categoriesRes.data);
      setLocations(locationsRes.data);
      setStores(storesRes.data);
      setUnits(unitsRes.data);
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchMasterData();
  }, []);

  // Only opens modal in response to user click
  const openActionModal = (type, item, options = {}) => {
    setActionModal({
      open: true,
      actionType: type,
      item,
      maxQuantity: item.quantity,
      isExpired: !!options.isExpired,
      askAddToList: !!options.askAddToList,
    });
  };

  // Always fully reset modal state
  const closeActionModal = () =>
    setActionModal({
      open: false,
      actionType: null,
      item: null,
      maxQuantity: 1,
      isExpired: false,
      askAddToList: false,
    });

  const filterInventory = (items) => {
    return items
      .filter((item) => {
        const matchesSearch = item.product?.name
          .toLowerCase()
          .includes(filters.search.toLowerCase());

        const matchesLocation =
          !filters.location || item.location?.name === filters.location;

        const matchesCategory =
          !filters.category || item.product?.category?.name === filters.category;

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

  const handleActionConfirm = async ({ quantity, addToList }) => {
    const { actionType, item, isExpired } = actionModal;

    if (actionType === 'open') {
      console.log(`Open/use ${quantity} of`, item.product?.name);
    } else if (actionType === 'remove') {
      if (isExpired) {
        if (addToList) {
          console.log('Add to shopping list:', item.product?.name);
        }
        console.log('Remove expired item:', item.product?.name);
      } else {
        console.log('Remove/consume:', quantity, item.product?.name);
      }
    } else if (actionType === 'addToList') {
      console.log('Add to shopping list:', item.product?.name);
    }
    closeActionModal();
    fetchInventory();
  };

  const renderActions = (item) => {
    const categoryType = item.product?.inventoryBehavior || 1;

    if (!item.opened) {
      return (
        <div className="flex space-x-2">
          <button
            className="btn btn-xs btn-primary tooltip"
            data-tip="Open/Use"
            onClick={() => openActionModal('open', item)}
          >
            <OpenIcon className="w-4 h-4" />
          </button>
          <button
            className="btn btn-xs btn-accent tooltip"
            data-tip="Add to Shopping List"
            onClick={() => openActionModal('addToList', item)}
          >
            <CartIcon className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (categoryType === 2 || categoryType === 3) {
      return (
        <div className="flex space-x-2">
          <button
            className="btn btn-xs btn-error tooltip"
            data-tip="Remove from Inventory"
            onClick={() => openActionModal('remove', item)}
          >
            <RemoveIcon className="w-4 h-4" />
          </button>
          <button
            className="btn btn-xs btn-accent tooltip"
            data-tip="Add to Shopping List"
            onClick={() => openActionModal('addToList', item)}
          >
            <CartIcon className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-4 pb-24">
      <InventoryHeader
        onAdd={() => setShowModal(true)}
        itemCount={inventoryItems.length}
        filters={filters}
        setFilters={setFilters}
        locations={locations.map(l => l.name)}
        categories={categories.map(c => c.name)}
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
              <th>Expiration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filterInventory(inventoryItems).map((item) => {
              const isExpiring =
                item.expiration && new Date(item.expiration) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                new Date(item.expiration) > new Date();
              const isExpired = item.expiration && new Date(item.expiration) < new Date();

              let quantityCell = `${item.quantity} ${item.unit}`;
              if (item.opened && (item.product?.inventoryBehavior === 2 || item.product?.inventoryBehavior === 3)) {
                quantityCell += ` | ${item.opened} open`;
              }

              return (
                <tr
                  key={item.id}
                  className={
                    isExpired
                      ? "bg-error/20 text-error"
                      : isExpiring
                      ? "bg-warning/20 text-warning"
                      : ""
                  }
                >
                  <td>{renderActions(item)}</td>
                  <td>{item.product?.name}</td>
                  <td>{quantityCell}</td>
                  <td>{item.location?.name}</td>
                  <td>{item.product?.category?.name || 'Uncategorized'}</td>
                  <td>
                    {item.expiration
                      ? new Date(item.expiration).toLocaleDateString()
                      : <span className="text-gray-500">None</span>}
                  </td>
                  <td>
                    {isExpired
                      ? "Expired"
                      : item.opened
                      ? "Open"
                      : "Unopened"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          fetchInventory();
          setShowModal(false);
        }}
        products={products}
        categories={categories}
        locations={locations}
        stores={stores}
        units={units}
      />

      {/* Universal Action Modal */}
      <ActionModal
        isOpen={actionModal.open}
        onClose={closeActionModal}
        actionType={actionModal.actionType}
        item={actionModal.item}
        maxQuantity={actionModal.maxQuantity}
        onConfirm={handleActionConfirm}
        isExpired={actionModal.isExpired}
        askAddToList={actionModal.askAddToList}
      />
    </div>
  );
}

export default Inventory;