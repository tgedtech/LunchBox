import React, { useEffect, useState } from 'react';
import RemoveIcon from '../assets/icons/minus.rectangle.svg?react';
import CartIcon from '../assets/icons/cart 1.svg?react';
import ActionModal from '../components/inventory/ActionModal';
import axios from '../utils/axiosInstance';

function ExpiredReportPage() {
  const [expiredItems, setExpiredItems] = useState([]);
  // Always initialize modal as closed
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
      const res = await axios.get('/inventory?expired=true');
      setExpiredItems(res.data);
    } catch (err) {
      console.error('Error fetching expired inventory:', err);
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

  // Always fully reset state, not just open: false
  const closeActionModal = () =>
    setActionModal({
      open: false,
      actionType: null,
      item: null,
      maxQuantity: 1,
      isExpired: true,
      askAddToList: true,
    });

  const handleActionConfirm = async ({ quantity, addToList }) => {
    const { actionType, item } = actionModal;
    if (actionType === 'remove') {
      if (addToList) {
        console.log('Add to shopping list:', item.product?.name);
      }
      console.log('Remove expired item:', item.product?.name);
    } else if (actionType === 'addToList') {
      console.log('Add to shopping list:', item.product?.name);
    }
    closeActionModal();
    fetchExpired();
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-3xl font-quicksand font-black mb-4">Expired Inventory</h1>
      <div className="overflow-x-auto rounded-lg shadow bg-base-100 font-nunito-sans">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Actions</th>
              <th>Item Name</th>
              <th>Quantity Expired</th>
              <th>Location</th>
              <th>Category</th>
              <th>Expired Date</th>
            </tr>
          </thead>
          <tbody>
            {expiredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6">
                  <span className="text-gray-500">No expired inventory.</span>
                </td>
              </tr>
            ) : (
              expiredItems.map(item => (
                <tr key={item.id}>
                  <td>
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
                  </td>
                  <td>{item.product?.name}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>{item.location?.name}</td>
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

export default ExpiredReportPage;