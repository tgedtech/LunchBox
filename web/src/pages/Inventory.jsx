import React, { useEffect, useState } from 'react';
import InventoryHeader from '../components/InventoryHeader';
import AddItemModal from '../components/inventory/AddItemModal';
import ActionModal from '../components/inventory/ActionModal';
import axios from '../utils/axiosInstance';

// === UTILS ===

// Group inventory items by productId for the accordion/grouped view
function groupByProduct(items) {
  const map = {};
  for (const item of items) {
    const prodId = item.productId;
    if (!map[prodId]) map[prodId] = [];
    map[prodId].push(item);
  }
  return map;
}

// Calculate expiration status flags
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

// DaisyUI button coloring for remove action
function getRemoveBtnClass(item) {
  const { isExpired, isErrorWindow, isWarningWindow } = getExpirationStatus(item.expiration);
  if (isExpired || isErrorWindow) return "btn btn-xs btn-error";
  if (isWarningWindow) return "btn btn-xs btn-warning";
  return "btn btn-xs btn-primary";
}

// Get soonest expiration date among array of inventory items
function getSoonestExpiration(items) {
  const valid = items.map(i => i.expiration).filter(Boolean);
  if (valid.length === 0) return null;
  return valid.map(d => new Date(d)).sort((a, b) => a - b)[0];
}

// === FILTERING & SORTING LOGIC ===

// Applies all filters from filter UI to the array of inventory items
function applyFilters(items, filters) {
  return items.filter(item => {
    // Name search
    if (filters.search && !item.product?.name?.toLowerCase().includes(filters.search.toLowerCase()))
      return false;
    // Location (exact match)
    if (filters.location && item.location?.name !== filters.location)
      return false;
    // Category (exact match)
    if (filters.category && item.product?.category?.name !== filters.category)
      return false;
    // Expiration logic
    if (filters.expiration) {
      const now = new Date();
      const exp = item.expiration ? new Date(item.expiration) : null;
      if (filters.expiration === "Expired" && (!exp || exp >= now)) return false;
      if (filters.expiration === "Expiring Soon") {
        if (!exp) return false;
        const soon = new Date(now); soon.setDate(now.getDate() + 14);
        if (!(exp >= now && exp <= soon)) return false;
      }
      if (filters.expiration === "Valid" && exp && exp < now) return false;
    }
    return true;
  });
}

// Sorting by user-chosen column
function applySort(items, sortBy) {
  if (!sortBy) return items;
  const sorted = [...items];
  if (sortBy === "Name") sorted.sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || ""));
  if (sortBy === "Quantity") sorted.sort((a, b) => (b.quantity - a.quantity));
  if (sortBy === "Expiration") sorted.sort((a, b) => new Date(a.expiration || 0) - new Date(b.expiration || 0));
  if (sortBy === "Price") sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
  return sorted;
}

// === MAIN COMPONENT ===

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
  const [expandedProducts, setExpandedProducts] = useState({});

  // Fetch inventory & master data on mount
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

  // Accordion logic for product groups
  const toggleExpand = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Action modal open/close
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
  const closeActionModal = () => setActionModal({
    open: false,
    actionType: null,
    item: null,
    maxQuantity: 1,
    isExpired: false,
    askAddToList: false,
  });
  const handleActionConfirm = async () => {
    closeActionModal();
    fetchInventory();
  };

  // === FILTERING & GROUPING ===
  const filtered = applySort(applyFilters(inventoryItems, filters), filters.sortBy);
  const productGroups = groupByProduct(filtered);

  return (
    <div className="p-4 pb-24">
      <InventoryHeader
        onAdd={() => setShowModal(true)}
        itemCount={filtered.length}
        filters={filters}
        setFilters={setFilters}
        locations={locations.map(l => l.name)}
        categories={categories.map(c => c.name)}
        expirations={['Expired', 'Expiring Soon', 'Valid']}
        sortOptions={['Name', 'Quantity', 'Expiration', 'Price']}
      />

      {/* Inventory Table - Grouped By Product */}
      <div className="overflow-x-auto rounded-lg shadow bg-base-100 font-nunito-sans">
        <table className="table w-full table-pin-rows">
          <colgroup>
            <col style={{ width: "4rem" }} />
            <col style={{ width: "32%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "36%" }} />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>Item Name</th>
              <th>Total Qty</th>
              <th>
                {/* Keep column header consistent. Shows soonest exp date or "Details" */}
                Details / Soonest Expiration
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(productGroups).map(([productId, instances]) => {
              const product = instances[0]?.product;
              const isExpanded = expandedProducts[productId];
              const totalQty = instances.reduce((sum, i) => sum + (i.quantity || 0), 0);
              const expiringSoon = instances.some(i => getExpirationStatus(i.expiration).isWarningWindow);
              const hasExpired = instances.some(i => getExpirationStatus(i.expiration).isExpired);

              const soonestExp = getSoonestExpiration(instances);

              return (
                <React.Fragment key={productId}>
                  <tr
                    className={
                      hasExpired
                        ? "bg-error/20 text-error cursor-pointer"
                        : expiringSoon
                          ? "bg-warning/20 text-warning cursor-pointer"
                          : "cursor-pointer"
                    }
                    onClick={() => toggleExpand(productId)}
                  >
                    <td>
                      <span
                        className="font-bold text-lg select-none"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') toggleExpand(productId);
                        }}
                        role="button"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "▾" : "▸"}
                      </span>
                    </td>
                    <td className="font-quicksand font-bold">{product?.name}</td>
                    <td>{totalQty} {instances[0]?.unit}</td>
                    {/* Details: when collapsed, show soonest expiration; expanded, column for lot breakdown */}
                    <td className="align-middle">
                      {!isExpanded ? (
                        soonestExp
                          ? <span>
                            <span className="font-medium text-xs text-gray-600">Next Exp:</span>{' '}
                            <span>{new Date(soonestExp).toLocaleDateString()}</span>
                          </span>
                          : <span className="text-xs text-gray-400">No Exp.</span>
                      ) : null}
                    </td>
                  </tr>
                  {/* Expanded: fixed 4-col layout, lots with details and actions */}
                  {isExpanded && (
                    <>
                      <tr className="bg-base-200 text-xs">
                        <th></th>
                        <th>Lot Details</th>
                        <th>Qty / Open</th>
                        <th>Store / Exp / Price / Actions</th>
                      </tr>
                      {instances.map((item) => {
                        const expStatus = getExpirationStatus(item.expiration);
                        return (
                          <tr
                            key={item.id}
                            className={
                              expStatus.isExpired
                                ? "bg-error/10 text-error"
                                : expStatus.isWarningWindow
                                  ? "bg-warning/10 text-warning"
                                  : ""
                            }
                          >
                            <td></td>
                            <td>
                              {item.location?.name}
                              {item.opened ? (
                                <span className="ml-1 badge badge-info badge-xs">Open</span>
                              ) : null}
                            </td>
                            <td>
                              {item.quantity} {item.unit}
                            </td>
                            <td className="relative min-w-[250px]">
                              <div className="pr-32 flex flex-wrap gap-2 items-center">
                                <span className="text-xs">{item.store?.name || ""}</span>
                                <span className="text-xs">
                                  {item.expiration
                                    ? new Date(item.expiration).toLocaleDateString()
                                    : <span className="text-gray-400">No Exp.</span>
                                  }
                                </span>
                                <span className="text-xs">
                                  {typeof item.price === 'number'
                                    ? `$${item.price.toFixed(2)}`
                                    : <span className="text-gray-400">No Price</span>
                                  }
                                </span>
                              </div>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 z-10">
                                <button
                                  className={getRemoveBtnClass(item)}
                                  onClick={e => { e.stopPropagation(); openActionModal('remove', item); }}
                                >
                                  Remove
                                </button>
                                {!item.opened && (
                                  <button
                                    className="btn btn-xs btn-primary"
                                    onClick={e => { e.stopPropagation(); openActionModal('open', item); }}
                                  >
                                    Open
                                  </button>
                                )}
                                <button
                                  className="btn btn-xs btn-success"
                                  onClick={e => { e.stopPropagation(); openActionModal('addToList', item); }}
                                >
                                  Add to List
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}
                </React.Fragment>
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
        updateInventoryItems={() => { }}
      />
    </div>
  );
}

export default Inventory;