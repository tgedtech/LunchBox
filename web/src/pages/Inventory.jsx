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

  // Fetch inventory data from the backend
  const fetchInventory = async () => {
    try {
      const res = await axios.get('/inventory');
      setInventoryItems(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  // Fetch all master data (products, categories, etc.)
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

  // Open the action modal for "open", "remove", or "addToList"
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

  // Close the action modal
  const closeActionModal = () =>
    setActionModal({
      open: false,
      actionType: null,
      item: null,
      maxQuantity: 1,
      isExpired: false,
      askAddToList: false,
    });

  // Update local state after actions
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

  // After a modal action, close modal and refetch
  const handleActionConfirm = async ({ quantity, addToList }) => {
    closeActionModal();
    fetchInventory();
  };

  /**
   * Groups Category 2 & 3 items by unique key for merge display.
   * Each group can have at most one unopened and one opened item.
   */
  function groupCat2and3(items) {
    const groups = {};
    items.forEach(item => {
      if (![2, 3].includes(item.product?.inventoryBehavior)) return;
      const key = [item.productId, item.locationId, item.unit, item.storeId || ''].join('-');
      if (!groups[key]) groups[key] = { unopened: null, opened: null, behavior: item.product.inventoryBehavior };
      if (item.opened) {
        groups[key].opened = item;
      } else {
        groups[key].unopened = item;
      }
    });
    return groups;
  }

  /**
   * Merges Category 2 & 3 inventory into single logical rows for display.
   */
  function mergedInventoryRows(items) {
    const groups = groupCat2and3(items);
    const handled = new Set();
    const rows = [];

    items.forEach(item => {
      const behavior = item.product?.inventoryBehavior;
      if (![2, 3].includes(behavior)) {
        rows.push(item);
      } else {
        const key = [item.productId, item.locationId, item.unit, item.storeId || ''].join('-');
        if (handled.has(key)) return;
        const group = groups[key];
        if (!group.unopened && group.opened) {
          rows.push({ ...group.opened, mergedCat: behavior });
        } else if (group.unopened && !group.opened) {
          rows.push({ ...group.unopened, mergedCat: behavior });
        } else if (group.unopened && group.opened) {
          rows.push({
            ...group.unopened,
            _unopened: group.unopened,
            _opened: group.opened,
            mergedCat: behavior,
          });
        }
        handled.add(key);
      }
    });
    return rows;
  }

  /**
   * Render actions for merged Cat 2/3 rows (all cases).
   * Handles Open, Remove, Add to Shopping List.
   * Remove button color (DaisyUI): default/primary/warning/error based on expiration window.
   */
  const renderActions = (item, expStatus) => {
    const categoryType = item.product?.inventoryBehavior || 1;

    // Cat 2/3: merged row with both opened and unopened
    if (item.mergedCat && item._opened && item._unopened) {
      // Remove only applies to opened, can't open another until removed
      const btnClass = getRemoveBtnClass(item._opened, expStatus);
      return (
        <div className="flex gap-2">
          <button
            className={btnClass}
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
    // Cat 2/3: unopened only
    if (item.mergedCat && !item.opened) {
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
    // Cat 2/3: opened only
    if (item.mergedCat && item.opened) {
      const btnClass = getRemoveBtnClass(item, expStatus);
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
    // Cat 1 (default): unopened
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
    // Cat 1 (default): opened/expired
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
   * Utility: Returns DaisyUI btn-warning/error/primary for REMOVE based on expiration.
   * @param {*} item 
   * @param {*} expStatus 
   */
  function getRemoveBtnClass(item, expStatus) {
    // expStatus: { isExpired, isErrorWindow, isWarningWindow }
    if (expStatus.isExpired) {
      return "btn btn-sm btn-error font-nunito-sans text-error-content";
    }
    if (expStatus.isErrorWindow) {
      return "btn btn-sm btn-error font-nunito-sans text-error-content";
    }
    if (expStatus.isWarningWindow) {
      return "btn btn-sm btn-warning font-nunito-sans text-warning-content";
    }
    return "btn btn-sm btn-primary font-nunito-sans text-primary-content";
  }

  /**
   * Render quantity: "X units | 1 open" for merged Cat 2/3 rows.
   */
  function renderQuantityCell(item) {
    if (item.mergedCat && item._unopened && item._opened) {
      const unopened = item._unopened?.quantity || 0;
      const opened = item._opened?.quantity || 0;
      return `${unopened} ${item.unit}${unopened !== 1 ? 's' : ''} | ${opened} open`;
    }
    if (item.mergedCat && !item.opened) {
      return `${item.quantity} ${item.unit}${item.quantity !== 1 ? 's' : ''}`;
    }
    if (item.mergedCat && item.opened) {
      return `${item.quantity} ${item.unit}${item.quantity !== 1 ? 's' : ''} open`;
    }
    return `${item.quantity} ${item.unit ? item.unit : ''}`.trim();
  }

  /**
   * Calculate expiration window flags for styling/buttons.
   * Returns { isExpired, isErrorWindow, isWarningWindow }
   * - isExpired: expired (< now)
   * - isErrorWindow: expires in <= 7 days (7 * 24 * 60 * 60 * 1000 ms)
   * - isWarningWindow: expires in <= 14 days, > 7 days
   */
  function getExpirationStatus(expDate) {
    if (!expDate) return { isExpired: false, isErrorWindow: false, isWarningWindow: false };
    const now = new Date();
    const exp = new Date(expDate);
    const msDiff = exp - now;
    const oneDay = 24 * 60 * 60 * 1000;
    if (exp < now) return { isExpired: true, isErrorWindow: false, isWarningWindow: false };
    if (msDiff <= 7 * oneDay) return { isExpired: false, isErrorWindow: true, isWarningWindow: false };
    if (msDiff <= 14 * oneDay) return { isExpired: false, isErrorWindow: false, isWarningWindow: true };
    return { isExpired: false, isErrorWindow: false, isWarningWindow: false };
  }

  /**
   * Table rendering.
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
              // For merged Cat 2/3: opened gets priority for expiration/status coloring, fallback to unopened
              let expDate = item.expiration;
              if (item.mergedCat && item._opened && item._opened.expiration) {
                expDate = item._opened.expiration;
              } else if (item.mergedCat && item._unopened && item._unopened.expiration) {
                expDate = item._unopened.expiration;
              }
              // Compute expiration flags
              const expStatus = getExpirationStatus(expDate);

              // Status logic: prefer status of opened unit if merged
              let status = "Unopened";
              if (item.mergedCat && item._opened) {
                status = expStatus.isExpired ? "Expired" : "Open";
              } else if (item.opened) {
                status = expStatus.isExpired ? "Expired" : "Open";
              } else if (expStatus.isExpired) {
                status = "Expired";
              }

              // Row coloring (DaisyUI): error=expired or error window, warning=warning window, else default
              let rowClass = "";
              if (expStatus.isExpired || expStatus.isErrorWindow) {
                rowClass = "bg-error/20 text-error";
              } else if (expStatus.isWarningWindow) {
                rowClass = "bg-warning/20 text-warning";
              }

              return (
                <tr
                  key={item.id + (item.mergedCat ? '_catmerge' : '')}
                  className={rowClass}
                >
                  <td>{renderActions(item, expStatus)}</td>
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
                    {expDate
                      ? new Date(expDate).toLocaleDateString()
                      : <span className="text-gray-500">None</span>}
                  </td>
                  <td>
                    {status}
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