import React, { useEffect, useState } from 'react';
import InventoryHeader from '../components/InventoryHeader';
import shoppingListService from '../services/shoppingListService';
import AddItemModal from '../components/inventory/AddItemModal';
import ActionModal from '../components/inventory/ActionModal';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useExpiredItems } from '../context/ExpiredItemsContext';

/**
 * Group a flat list of inventory item instances by their productId.
 * Each "product group" represents all on-hand instances (e.g., multiple jars) of the same product.
 */
function groupByProduct(items) {
  const map = {};
  for (const item of items) {
    const prodId = item.productId;
    if (!map[prodId]) map[prodId] = [];
    map[prodId].push(item);
  }
  return map;
}

/**
 * Determine expiration status buckets for a given expiration date.
 * - Expired: past today
 * - Error window: within 7 days
 * - Warning: within 14 days (but not within 7)
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

/** Class for the "Remove" button based on expiration urgency. */
function getRemoveBtnClass(item) {
  const { isExpired, isErrorWindow, isWarningWindow } = getExpirationStatus(item.expiration);
  if (isExpired || isErrorWindow) return "btn btn-xs btn-error";
  if (isWarningWindow) return "btn btn-xs btn-warning";
  return "btn btn-xs btn-primary";
}

/** Soonest expiration among a set of instances for one product. */
function getSoonestExpiration(items) {
  const valid = items.map(i => i.expiration).filter(Boolean);
  if (valid.length === 0) return null;
  return valid.map(d => new Date(d)).sort((a, b) => a - b)[0];
}

/** Apply user-selected filters. */
function applyFilters(items, filters) {
  return items.filter(item => {
    if (filters.search && !item.product?.name?.toLowerCase().includes(filters.search.toLowerCase()))
      return false;
    if (filters.location && item.location?.name !== filters.location)
      return false;
    if (filters.category && item.product?.category?.name !== filters.category)
      return false;
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

/** Apply client-side sorting. */
function applySort(items, sortBy) {
  if (!sortBy) return items;
  const sorted = [...items];

  if (sortBy === "Name") {
    sorted.sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || ""));
  }
  if (sortBy === "Quantity") {
    sorted.sort((a, b) => (b.quantity - a.quantity));
  }
  if (sortBy === "Expiration") {
    sorted.sort((a, b) => new Date(a.expiration || 0) - new Date(b.expiration || 0));
  }
  if (sortBy === "Price") {
    // Prefer per-unit, then total, then legacy price
    const getPriceKey = (x) => {
      if (typeof x.pricePerUnit === 'number') return x.pricePerUnit;
      if (typeof x.priceTotal === 'number' && x.quantity > 0) return x.priceTotal / x.quantity;
      if (typeof x.price === 'number') return x.price;
      return -Infinity;
    };
    sorted.sort((a, b) => getPriceKey(b) - getPriceKey(a));
  }
  return sorted;
}

/**
 * Inventory page
 * - Fetch/display current inventory instances.
 * - Filter/sort and group by product.
 * - Actions: Remove units, mark Open, Add to shopping list.
 */
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

  const navigate = useNavigate();
  const { expiredCount, refreshExpired } = useExpiredItems();

  const now = new Date();
  const validItems = inventoryItems.filter(item =>
    !item.expiration || new Date(item.expiration) >= now
  );

  /** Fetch inventory and update expired badge count. */
  const fetchInventory = async () => {
    try {
      const res = await axios.get('/inventory');
      setInventoryItems(res.data);
      refreshExpired();
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  /** Fetch master data for filters and Add Item modal. */
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

  /** Initial load. */
  useEffect(() => {
    fetchInventory();
    fetchMasterData();
  }, []);

  /** Toggle expand/collapse for a product group. */
  const toggleExpand = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  /** Open the action modal for a specific item instance. */
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

  /** Close/reset the action modal. */
  const closeActionModal = () => setActionModal({
    open: false,
    actionType: null,
    item: null,
    maxQuantity: 1,
    isExpired: false,
    askAddToList: false,
  });

  /**
   * Handle confirmation from ActionModal.
   * - addToList: push a prefilled item to the Shopping List service.
   * - then refresh inventory to reflect changes.
   */
  const handleActionConfirm = async (actionData) => {
    const { quantity = 1 } = actionData || {};
    const { actionType, item } = actionModal;

    if (actionType === 'addToList' && item) {
      try {
        await shoppingListService.addItem({
          productId: item.productId || item.product?.id,
          name: item.product?.name || item.name,
          quantity: quantity,
          unit: item.unit || item.product?.defaultUnit || '',
          categoryId: item.product?.categoryId || '',
          notes: '',
          storeId: item.storeId || '',
        });
      } catch (err) {
        console.error('Failed to add to shopping list:', err);
      }
    }

    closeActionModal();
    fetchInventory();
  };

  const filtered = applySort(applyFilters(validItems, filters), filters.sortBy);
  const productGroups = groupByProduct(filtered);

  return (
    <div className="bg-primary-content min-h-screen w-full pb-24">
      {/* Header with controls: search, filters, sort, and "Add Item" */}
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

      {/* Main table: product-level summary rows with expandable per-instance details */}
      <main className="flex-1 px-4 pb-24">
        <table className="table w-full table-pin-rows mt-4 bg-base-200">
          <colgroup>
            <col style={{ width: "4rem" }} />
            <col style={{ width: "32%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "36%" }} />
          </colgroup>
          <thead>
            <tr className="bg-secondary text-secondary-content">
              <th></th>
              <th>Item Name</th>
              <th>Total Qty</th>
              <th>Details / Soonest Expiration</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(productGroups).map(([productId, instances]) => {
              const product = instances[0]?.product;
              const isExpanded = expandedProducts[productId];
              const totalQty = instances.reduce((sum, i) => sum + (i.quantity || 0), 0);
              const expiringSoon = instances.some(i => getExpirationStatus(i.expiration).isWarningWindow);
              const soonestExp = getSoonestExpiration(instances);

              return (
                <React.Fragment key={productId}>
                  {/* Product group summary row (click to expand) */}
                  <tr
                    className={
                      expiringSoon
                        ? "bg-warning/20 text-warning cursor-pointer"
                        : "cursor-pointer"
                    }
                    onClick={() => toggleExpand(productId)}
                  >
                    <td>
                      {/* Keyboard-accessible disclosure indicator */}
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

                  {/* Detail rows: each physical instance with location, qty, open flag, store, expiration, price, and actions */}
                  {isExpanded && (
                    <>
                      <tr className="bg-secondary/30 text-xs">
                        <th></th>
                        <th>Location</th>
                        <th>Qty / Open</th>
                        <th>Store / Exp / Price / Actions</th>
                      </tr>
                      {instances.map((item) => {
                        const expStatus = getExpirationStatus(item.expiration);
                        return (
                          <tr
                            key={item.id}
                            className={
                              expStatus.isWarningWindow ? "bg-warning/10 text-warning" : ""
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
                            <td className="relative min-w-[260px]">
                              <div className="pr-36 flex flex-wrap gap-2 items-center">
                                <span className="text-xs">{item.store?.name || ""}</span>
                                <span className="text-xs">
                                  {item.expiration
                                    ? new Date(item.expiration).toLocaleDateString()
                                    : <span className="text-gray-400">No Exp.</span>
                                  }
                                </span>

                                {/* Price display (per-unit preferred, show total if available). Backward compatible. */}
                                <span className="text-xs">
                                  {(() => {
                                    const qty = Number(item.quantity) || 0;
                                    const hasBasis = typeof item.priceBasis === 'string';
                                    const hasPer = typeof item.pricePerUnit === 'number' && item.pricePerUnit >= 0;
                                    const hasTotal = typeof item.priceTotal === 'number' && item.priceTotal >= 0;
                                    const hasLegacy = typeof item.price === 'number' && item.price >= 0;

                                    // If explicit per-unit is stored, show it (and total if present)
                                    if (hasPer) {
                                      return hasTotal
                                        ? `$${item.pricePerUnit.toFixed(2)} / ${item.unit} · $${item.priceTotal.toFixed(2)}`
                                        : `$${item.pricePerUnit.toFixed(2)} / ${item.unit}`;
                                    }

                                    // If only total is present, compute per-unit when qty is known
                                    if (hasTotal && qty > 0) {
                                      const per = item.priceTotal / qty;
                                      return `$${per.toFixed(2)} / ${item.unit} · $${item.priceTotal.toFixed(2)}`
                                    }

                                    // Legacy: if basis is known, respect it; else treat legacy price as per-unit (safer default)
                                    if (hasLegacy) {
                                      if (hasBasis && item.priceBasis === 'TOTAL' && qty > 0) {
                                        const per = item.price / qty;
                                        return `$${per.toFixed(2)} / ${item.unit} · $${item.price.toFixed(2)}`
                                      }
                                      // default to per-unit display
                                      return `$${item.price.toFixed(2)} / ${item.unit}`;
                                    }

                                    return <span className="text-gray-400">No Price</span>;
                                  })()}
                                </span>
                              </div>

                              {/* Row actions */}
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
                                  className="btn btn-xs btn-accent text-accent-content"
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
      </main>

      {/* Modal: add a brand-new inventory instance */}
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

      {/* Modal: per-instance actions (remove qty, mark open, add to shopping list) */}
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