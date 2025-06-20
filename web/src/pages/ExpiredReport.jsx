import React, { useEffect, useState } from 'react';
import ActionModal from '../components/inventory/ActionModal';
import axios from '../utils/axiosInstance';
import shoppingListService from '../services/shoppingListService';

function ExpiredReportPage() {
  const [expiredItems, setExpiredItems] = useState([]);
  const [actionModal, setActionModal] = useState({
    open: false,
    actionType: null,
    item: null,
    maxQuantity: 1,
    isExpired: true,
    askAddToList: true,
  });

  const fetchExpired = async () => {
    try {
      const res = await axios.get('/inventory');
      const now = new Date();
      const expired = res.data.filter(item =>
        item.expiration && new Date(item.expiration) < now
      );
      setExpiredItems(expired);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  useEffect(() => {
    fetchExpired();
  }, []);

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

  const closeActionModal = () => setActionModal({
    open: false,
    actionType: null,
    item: null,
    maxQuantity: 1,
    isExpired: true,
    askAddToList: true,
  });

  const handleActionConfirm = async ({ quantity, addToList }) => {
    const { actionType, item } = actionModal;

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

    closeActionModal();
    fetchExpired();
  };

  return (
    <div className="w-full min-h-screen bg-base-100">
      {/* Full-width sticky header */}
      <header className="w-full bg-error text-error-content shadow-lg flex items-center px-8 py-4 sticky top-0 z-30" style={{ minHeight: '88px' }}>
        <h1 className="text-3xl font-quicksand font-black flex-1">
          Expired Inventory
        </h1>
        {/* (Add additional actions here if you want in future) */}
      </header>

      {/* Main content container */}
      <div className="p-4 pb-24">
        <div className="overflow-x-auto rounded-lg shadow bg-base-100 font-nunito-sans">
          <table className="table w-full table-pin-rows">
            <thead>
              <tr>
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