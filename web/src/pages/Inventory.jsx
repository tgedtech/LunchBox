import React, { useEffect, useState } from 'react';
import InventoryHeader from '../components/InventoryHeader';
import AddItemModal from '../components/inventory/AddItemModal';
import ActionModal from '../components/inventory/ActionModal';
import axios from '../utils/axiosInstance';

// Utility: Group inventory items by product
function groupByProduct(items) {
  const map = {};
  for (const item of items) {
    const prodId = item.productId;
    if (!map[prodId]) map[prodId] = [];
    map[prodId].push(item);
  }
  return map;
}

// Utility: For status/expiration
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

// Utility: DaisyUI remove button class based on expiration
function getRemoveBtnClass(item) {
  const { isExpired, isErrorWindow, isWarningWindow } = getExpirationStatus(item.expiration);
  if (isExpired || isErrorWindow) return "btn btn-xs btn-error";
  if (isWarningWindow) return "btn btn-xs btn-warning";
  return "btn btn-xs btn-primary";
}

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

  // Tracks which productIds are expanded
  const [expandedProducts, setExpandedProducts] = useState({});

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

  // Expand/collapse handler
  const toggleExpand = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // ActionModal helpers
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

  // Group items by product
  const productGroups = groupByProduct(inventoryItems);

  // --- UI Render ---
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

      {/* Inventory Table - Grouped By Product */}
      <div className="overflow-x-auto rounded-lg shadow bg-base-100 font-nunito-sans">
        <table className="table w-full table-zebra">
          <thead>
            <tr>
              <th></th>
              <th>Item Name</th>
              <th>Total Qty</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(productGroups).map(([productId, instances]) => {
              const product = instances[0]?.product;
              const isExpanded = expandedProducts[productId];
              // Aggregate info
              const totalQty = instances.reduce((sum, i) => sum + (i.quantity || 0), 0);
              const expiringSoon = instances.some(i => getExpirationStatus(i.expiration).isWarningWindow);
              const hasExpired = instances.some(i => getExpirationStatus(i.expiration).isExpired);

              // Summary row
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
                      <span className="font-bold text-lg select-none">
                        {isExpanded ? "▾" : "▸"}
                      </span>
                    </td>
                    <td className="font-quicksand font-bold">
                      {product?.name}
                    </td>
                    <td>
                      {totalQty} {instances[0]?.unit}
                    </td>
                    <td>
                      {instances.length} lot{instances.length > 1 ? "s" : ""}
                    </td>
                  </tr>
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
                            <td className="flex flex-wrap gap-2 items-center">
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
                              {/* Actions */}
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
        updateInventoryItems={() => {}} // handled by fetchInventory for now
      />
    </div>
  );
}

export default Inventory;