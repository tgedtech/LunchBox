import React, { useEffect, useState } from 'react';
import ActionModal from '../components/inventory/ActionModal';
import axios from '../utils/axiosInstance';
import shoppingListService from '../services/shoppingListService';
import { useNavigate } from 'react-router-dom';

/**
 * ExpiredReportPage
 *
 * Purpose
 * -------
 * - Show all inventory items that are past their expiration date.
 * - Let the user (a) remove expired stock and optionally add it to the shopping list,
 *   or (b) directly add expired items to the shopping list for replacement.
 * - If there are no expired items, optionally redirect back to the main Inventory page.
 *
 * Data Flow
 * ---------
 * - GET /inventory → full inventory list
 *   → filtered client-side to items with expiration < now
 * - Actions are confirmed in a modal. When an action completes, the page refetches
 *   and (if empty) can redirect back to /inventory.
 */
function ExpiredReportPage() {
  // List of items whose expiration date is in the past.
  const [expiredItems, setExpiredItems] = useState([]);

  // State for the action modal (remove / addToList workflows act on a single item).
  const [actionModal, setActionModal] = useState({
    open: false,
    actionType: null,     // 'remove' | 'addToList'
    item: null,           // the inventory record being acted on
    maxQuantity: 1,       // limit for removal quantity selector
    isExpired: true,      // flag passed to modal for context/wording
    askAddToList: true,   // whether the modal should show the "also add to list" prompt
  });

  const navigate = useNavigate();

  /**
   * Load all inventory, then keep only items already expired.
   * If redirectIfEmpty is true and nothing is expired, send user back to /inventory.
   */
  const fetchExpired = async (redirectIfEmpty = false) => {
    try {
      const res = await axios.get('/inventory');
      const now = new Date();
      const expired = res.data.filter(item =>
        item.expiration && new Date(item.expiration) < now
      );
      setExpiredItems(expired);

      if (redirectIfEmpty && expired.length === 0) {
        navigate('/inventory', { replace: true });
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  // Initial load: fetch the expired list once on mount.
  useEffect(() => {
    fetchExpired();
  }, []);

  /**
   * Open the modal for a given action on a specific expired item.
   * - For 'remove', we also surface "add to list?" since the user likely needs a replacement.
   * - For 'addToList', we do not ask again; it goes straight to the list on confirm.
   */
  const openActionModal = (type, item) => {
    setActionModal({
      open: true,
      actionType: type,
      item,
      maxQuantity: item.quantity,
      isExpired: true,
      askAddToList: type === 'remove',
    });
  };

  // Close the modal and reset its state.
  const closeActionModal = () => setActionModal({
    open: false,
    actionType: null,
    item: null,
    maxQuantity: 1,
    isExpired: true,
    askAddToList: true,
  });

  /**
   * Handle action confirmation from the modal.
   * - If the action is 'addToList', create a shopping list entry.
   * - If the action is 'remove' and the user checked "also add to list",
   *   create a shopping list entry after removal.
   * - After any action, refresh the expired list and navigate back to inventory if empty.
   */
  const handleActionConfirm = async ({ quantity, addToList }) => {
    const { actionType, item } = actionModal;

    // Add a replacement entry to the shopping list when appropriate.
    if ((actionType === 'addToList') || (actionType === 'remove' && addToList)) {
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
        console.error('Failed to add expired item to shopping list:', err);
      }
    }

    // Close modal and refresh; redirect if no expired items remain.
    closeActionModal();
    await fetchExpired(true);
  };

  return (
    <div className="w-full min-h-screen bg-base-100">
      {/* Page header (red theme to signal "expired/needs attention") */}
      <div className="bg-error min-h-15">
        <div className="flex justify-between">
          <h1 className="text-xl font-quicksand font-bold text-error-content p-4">
            Expired Inventory
          </h1>
        </div>
      </div>

      {/* Expired items table with actions */}
      <div className="p-4 pb-24">
        <div className="overflow-x-auto rounded-lg shadow bg-base-100 font-nunito-sans">
          <table className="table w-full table-pin-rows">
            <thead>
              <tr className="bg-error text-error-content">
                <th>Actions</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Store</th>
                <th>Location</th>
                <th>Category</th>
                <th>Expired Date</th>
              </tr>
            </thead>
            <tbody>
              {expiredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    No expired inventory.
                  </td>
                </tr>
              ) : (
                expiredItems.map(item => (
                  <tr key={item.id} className="bg-error/10 text-error">
                    <td>
                      <div className="flex gap-1">
                        <button
                          className="btn btn-xs btn-error"
                          onClick={() => openActionModal('remove', item)}
                        >
                          Remove
                        </button>
                        <button
                          className="btn btn-xs btn-success"
                          onClick={() => openActionModal('addToList', item)}
                        >
                          Add to List
                        </button>
                      </div>
                    </td>
                    <td>{item.product?.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>{item.store?.name || ''}</td>
                    <td>{item.location?.name || ''}</td>
                    <td>{item.product?.category?.name || 'Uncategorized'}</td>
                    <td>
                      {item.expiration
                        ? new Date(item.expiration).toLocaleDateString()
                        : <span className="text-gray-500">None</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for "Remove" and "Add to List" actions on an expired item */}
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
    </div>
  );
}

export default ExpiredReportPage;