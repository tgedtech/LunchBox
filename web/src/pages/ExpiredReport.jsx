import React, { useEffect, useState } from 'react';
import ActionModal from '../components/inventory/ActionModal';
import axios from '../utils/axiosInstance';
import shoppingListService from '../services/shoppingListService';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

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

  useEffect(() => {
    fetchExpired();
    // eslint-disable-next-line
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
    await fetchExpired(true); // Pass true to enable redirect if now empty
  };

  return (
    <div className="w-full min-h-screen bg-base-100">
      {/* Header for the page */}
      <div className="bg-error min-h-15">
        <div className="flex justify-between">
          <h1 className="text-xl font-quicksand font-bold text-error-content p-4">Expired Inventory</h1>
        </div>
      </div>

      {/* Main content container */}
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