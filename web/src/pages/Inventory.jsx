import React, { useEffect, useState } from 'react';
import OpenIcon from '../assets/icons/inventory.open1.svg?react';
import RemoveIcon from '../assets/icons/minus.rectangle.svg?react';
import CartIcon from '../assets/icons/cart 1.svg?react';
import InventoryHeader from '../components/InventoryHeader';
import AddItemModal from '../components/inventory/AddItemModal';
import ActionModal from '../components/inventory/ActionModal';
import axios from '../utils/axiosInstance';

/**
 * CATEGORY_LABELS maps backend behavior numbers to readable strings.
 */
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

  const [actionModal, setActionModal] = useState({
    open: false,
    actionType: null,
    item: null,
    maxQuantity: 1,
    isExpired: false,
    askAddToList: false,
  });

  // Fetch all inventory and master data on mount
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

  /**
   * Opens the ActionModal for a given item and action type.
   */
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

  /**
   * Closes the ActionModal.
   */
  const closeActionModal = () =>
    setActionModal({
      open: false,
      actionType: null,
      item: null,
      maxQuantity: 1,
      isExpired: false,
      askAddToList: false,
    });

  /**
   * Local UI update after any action.
   */
  const updateInventoryItems = (originalItem, updatedArray) => {
    setInventoryItems(prev => {
      let newItems = prev.filter(item => item.id !== originalItem.id);
      if (Array.isArray(updatedArray)) {
        const ids = new Set(newItems.map(i => i.id));
        updatedArray.forEach(item => {
          if (item && !ids.has(item.id)) newItems.push(item);
        });
      }
      return newItems;
    });
  };

  const handleActionConfirm = async ({ quantity, addToList }) => {
    closeActionModal();
    fetchInventory();
  };

  /**
   * Groups inventory items for Category 2 (long-lasting) by product/location/unit/store.
   * Returns:
   *   - unopened (quantity, item)
   *   - opened (item)
   */
  function groupCat2(items) {
    // Key: productId-locationId-unit-storeId (null store OK)
    const groups = {};
    items.forEach(item => {
      if (item.product?.inventoryBehavior !== 2) return;
      const key = [item.productId, item.locationId, item.unit, item.storeId || ''].join('-');
      if (!groups[key]) groups[key] = { unopened: null, opened: null };
      if (item.opened) {
        groups[key].opened = item;
      } else {
        groups[key].unopened = item;
      }
    });
    return groups;
  }

  /**
   * For display: merges Category 2 opened/unopened as single logical rows
   * For others: returns as-is
   */
  function mergedInventoryRows(items) {
    const cat2Groups = groupCat2(items);
    const handled = new Set();
    const rows = [];

    items.forEach(item => {
      if (item.product?.inventoryBehavior !== 2) {
        rows.push(item);
      } else {
        // Only display one row per group
        const key = [item.productId, item.locationId, item.unit, item.storeId || ''].join('-');
        if (handled.has(key)) return;
        const group = cat2Groups[key];
        if (!group.unopened && group.opened) {
          // Only opened left
          rows.push(group.opened);
        } else if (group.unopened && !group.opened) {
          // Only unopened left
          rows.push(group.unopened);
        } else if (group.unopened && group.opened) {
          // Both exist: merge into a single row object for rendering
          rows.push({
            ...group.unopened,
            // Attach both for rendering: don't duplicate
            _unopened: group.unopened,
            _opened: group.opened,
            mergedCat2: true,
          });
        }
        handled.add(key);
      }
    });

    return rows;
  }

  /**
   * Table row actions.
   * Category 2 (long-lasting): 
   *   - "Open" if unopened and not already open
   *   - "Remove" if opened
   *   - If both exist (merged row), "Remove" acts on opened, cannot "Open" another until opened is removed.
   * Category 1: always "Open" (and remove when 0 left)
   */
  const renderActions = (item) => {
  const categoryType = item.product?.inventoryBehavior || 1;

  // CATEGORY 2: merged row = opened+unopened, only REMOVE
  if (item.mergedCat2) {
    return (
      <div className="flex gap-2">
        <button
          className="btn btn-sm btn-primary font-nunito-sans text-primary-content"
          onClick={() => openActionModal('open', item._opened)}
        >
          Remove
        </button>
        <button
          className="btn btn-sm btn-success font-nunito-sans text-success-content"
          onClick={() => openActionModal('addToList', item._opened)}
        >
          Add to Shopping List
        </button>
      </div>
    );
  }
  // CATEGORY 2: unopened
  if (categoryType === 2 && !item.opened) {
    return (
      <div className="flex gap-2">
        <button
          className="btn btn-sm btn-primary font-nunito-sans text-primary-content"
          onClick={() => openActionModal('open', item)}
        >
          Open
        </button>
        <button
          className="btn btn-sm btn-success font-nunito-sans text-success-content"
          onClick={() => openActionModal('addToList', item)}
        >
          Add to Shopping List
        </button>
      </div>
    );
  }
  // CATEGORY 2: opened only (no unopened left)
  if (categoryType === 2 && item.opened) {
    // If expired: use error, warning, etc. class
    let btnClass = "btn btn-sm btn-primary font-nunito-sans text-primary-content";
    if (item.expiration && new Date(item.expiration) < new Date()) {
      btnClass = "btn btn-sm btn-error font-nunito-sans text-error-content";
    } else if (item.expiration && new Date(item.expiration) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      btnClass = "btn btn-sm btn-warning font-nunito-sans text-warning-content";
    }
    return (
      <div className="flex gap-2">
        <button
          className={btnClass}
          onClick={() => openActionModal('open', item)}
        >
          Remove
        </button>
        <button
          className="btn btn-sm btn-success font-nunito-sans text-success-content"
          onClick={() => openActionModal('addToList', item)}
        >
          Add to Shopping List
        </button>
      </div>
    );
  }
  // CATEGORY 1/3 (normal)
  if (!item.opened) {
    return (
      <div className="flex gap-2">
        <button
          className="btn btn-sm btn-primary font-nunito-sans text-primary-content"
          onClick={() => openActionModal('open', item)}
        >
          Open
        </button>
        <button
          className="btn btn-sm btn-success font-nunito-sans text-success-content"
          onClick={() => openActionModal('addToList', item)}
        >
          Add to Shopping List
        </button>
      </div>
    );
  }
  // Opened, not category 2
  return (
    <div className="flex gap-2">
      <button
        className="btn btn-sm btn-error font-nunito-sans text-error-content"
        onClick={() => openActionModal('remove', item)}
      >
        Remove from Inventory
      </button>
      <button
        className="btn btn-sm btn-success font-nunito-sans text-success-content"
        onClick={() => openActionModal('addToList', item)}
      >
        Add to Shopping List
      </button>
    </div>
  );
};

  /**
   * Renders quantity column, e.g. "2 bottles | 1 open"
   */
  function renderQuantityCell(item) {
    // Category 2, merged row
    if (item.mergedCat2) {
      const unopened = item._unopened?.quantity || 0;
      const opened = item._opened?.quantity || 0;
      return `${unopened} ${item.unit}${unopened !== 1 ? 's' : ''} | ${opened} open`;
    }
    // Category 2, only unopened
    if (item.product?.inventoryBehavior === 2 && !item.opened) {
      return `${item.quantity} ${item.unit}${item.quantity !== 1 ? 's' : ''}`;
    }
    // Category 2, only opened
    if (item.product?.inventoryBehavior === 2 && item.opened) {
      return `${item.quantity} ${item.unit}${item.quantity !== 1 ? 's' : ''} | ${item.quantity} open`;
    }
    // Others: as previously
    return `${item.quantity}`;
  }

  /**
   * Renders each inventory table row.
   */
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
        sortOptions={['Name', 'Quantity', 'Expiration', 'Price']}
      />

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-base-100 font-nunito-sans">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Location</th>
              <th>Category</th>
              <th>Store</th>
              <th>Price</th>
              <th>Expiration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mergedInventoryRows(inventoryItems).map((item) => {
              const isExpiring =
                item.expiration && new Date(item.expiration) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
                new Date(item.expiration) > new Date();
              const isExpired = item.expiration && new Date(item.expiration) < new Date();

              return (
                <tr
                  key={item.id + (item.mergedCat2 ? '_cat2' : '')}
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
                  <td>{renderQuantityCell(item)}</td>
                  <td>{item.unit}</td>
                  <td>{item.location?.name}</td>
                  <td>{item.product?.category?.name || 'Uncategorized'}</td>
                  <td>{item.store?.name || ''}</td>
                  <td>
                    {typeof item.price === 'number'
                      ? `$${item.price.toFixed(2)}`
                      : <span className="text-gray-500">None</span>}
                  </td>
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
        refreshMasterData={fetchMasterData}
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
        updateInventoryItems={updateInventoryItems}
      />
    </div>
  );
}

export default Inventory;