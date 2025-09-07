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
 *
 * @param {Array} items - Inventory instances from the API.
 * @returns {Object} A map of productId -> [instances...]
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
 * - Expired:      past today
 * - Error window: expiring within 7 days
 * - Warning:      expiring within 14 days (but not within 7)
 *
 * These buckets drive color/state styling and button emphasis in the UI.
 *
 * @param {string|Date|null} expDate - An ISO date string or Date, or null if not tracked.
 * @returns {{isExpired:boolean,isErrorWindow:boolean,isWarningWindow:boolean}}
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
 * Return a DaisyUI class for the "Remove" action button based on expiration urgency.
 * Red (error) if expired/very soon, amber (warning) if within 14 days, otherwise primary.
 */
function getRemoveBtnClass(item) {
  const { isExpired, isErrorWindow, isWarningWindow } = getExpirationStatus(item.expiration);
  if (isExpired || isErrorWindow) return "btn btn-xs btn-error";
  if (isWarningWindow) return "btn btn-xs btn-warning";
  return "btn btn-xs btn-primary";
}

/**
 * Find the earliest (soonest) expiration among a set of instances of the same product.
 * Used to summarize a product group's next critical date in the collapsed view.
 */
function getSoonestExpiration(items) {
  const valid = items.map(i => i.expiration).filter(Boolean);
  if (valid.length === 0) return null;
  return valid.map(d => new Date(d)).sort((a, b) => a - b)[0];
}

/**
 * Apply user-selected filters to the item list (search, location, category, expiration buckets).
 * This runs client-side on the already-fetched dataset.
 */
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

/**
 * Apply client-side sorting to the filtered list.
 * Supported: Name (A→Z), Quantity (desc), Expiration (earliest first), Price (desc).
 */
function applySort(items, sortBy) {
  if (!sortBy) return items;
  const sorted = [...items];
  if (sortBy === "Name") sorted.sort((a, b) => (a.product?.name || "").localeCompare(b.product?.name || ""));
  if (sortBy === "Quantity") sorted.sort((a, b) => (b.quantity - a.quantity));
  if (sortBy === "Expiration") sorted.sort((a, b) => new Date(a.expiration || 0) - new Date(b.expiration || 0));
  if (sortBy === "Price") sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
  return sorted;
}

/**
 * Inventory page
 *
 * Purpose:
 * - Fetch and display all current inventory instances.
 * - Allow filtering/sorting.
 * - Collapse items into product groups with a one-row summary and an expandable detail view.
 * - Provide actions: Remove units, mark Open, and Add to shopping list.
 *
 * Data flows:
 * - /inventory      → item instances (each has product, location, store, qty, unit, expiration, price)
 * - /products, /categories, /locations, /stores, /units → master data for forms and filters
 *
 * UX:
 * - Top header: search, filters, sort, "Add item" button.
 * - Table: one row per product group with expand/collapse; details show each instance with actions.
 * - Modals: AddItemModal for creating new instances; ActionModal for per-instance operations.
 */
function Inventory() {
  // Core datasets
  const [inventoryItems, setInventoryItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stores, setStores] = useState([]);
  const [units, setUnits] = useState([]);

  // UI filter state
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    expiration: '',
    sortBy: '',
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [actionModal, setActionModal] = useState({
    open: false,
    actionType: null, // 'remove' | 'open' | 'addToList'
    item: null,
    maxQuantity: 1,
    isExpired: false,
    askAddToList: false,
  });

  // Track which product groups are expanded (productId -> bool)
  const [expandedProducts, setExpandedProducts] = useState({});

  // Hooks/utilities
  const navigate = useNavigate();
  const { expiredCount, refreshExpired } = useExpiredItems();

  // Filter out items that are already expired from the main list view.
  // (Expired items can be managed elsewhere; this screen focuses on what's still usable or soon expiring.)
  const now = new Date();
  const validItems = inventoryItems.filter(item =>
    !item.expiration || new Date(item.expiration) >= now
  );

  /**
   * Fetch the latest inventory from the API.
   * Also triggers a refresh of the global expired-count badge via context.
   */
  const fetchInventory = async () => {
    try {
      const res = await axios.get('/inventory');
      setInventoryItems(res.data);
      refreshExpired();
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  /**
   * Fetch master data (products, categories, locations, stores, units)
   * used for filters and the Add Item modal.
   */
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

  /**
   * Initial load: fetch inventory instances and master data once on mount.
   */
  useEffect(() => {
    fetchInventory();
    fetchMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Expand/collapse a product group row in the table.
   */
  const toggleExpand = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  /**
   * Open the action modal for a given operation on a specific item instance.
   * @param {'remove'|'open'|'addToList'} type
   * @param {Object} item - The inventory instance to act on.
   * @param {Object} options - Additional flags for the modal.
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
   * Close and reset the action modal.
   */
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
   * - 'remove' and 'open' behaviors are implemented inside ActionModal via API calls or are no-ops here,
   *   then we refresh inventory to reflect the change.
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

  // Apply filters and sort on the active (non-expired) items for display.
  const filtered = applySort(applyFilters(validItems, filters), filters.sortBy);

  // Collapse to product groups for a cleaner, high-level table.
  const productGroups = groupByProduct(filtered);

  return (
    <div className="w-full pb-24">
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
        <table className="table w-full table-pin-rows mt-4 bg-neutral-content">
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
                      {/* When collapsed, show the soonest expiration for this product group */}
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
                      <tr className="bg-base-200 text-xs">
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
                              expStatus.isWarningWindow
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

                              {/* Row actions for this instance:
                                  - Remove some/all quantity
                                  - Mark container as Open (if not already)
                                  - Add this product back to the shopping list */}
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