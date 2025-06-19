import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from '../../utils/axiosInstance';

function formatExpiration(date) {
  if (!date) return null;
  const expDate = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Expires today';
  return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
}

function ActionModal({
  isOpen,
  onClose,
  actionType,
  item,
  maxQuantity,
  onConfirm,
  isExpired = false,
  askAddToList = false,
  afterAction,
  updateInventoryItems,
}) {
  const [quantity, setQuantity] = useState(1);
  const [addToList, setAddToList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setAddToList(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const catBehavior = item.product?.inventoryBehavior;
  let prompt;
  if (actionType === 'open') {
    if ((catBehavior === 2 || catBehavior === 3) && item.opened) {
      prompt = 'Remove from inventory';
    } else {
      prompt = `Open/use item${maxQuantity > 1 ? 's' : ''}`;
    }
  } else if (actionType === 'remove') {
    prompt = `Remove from inventory`;
  } else if (actionType === 'addToList') {
    prompt = `Add to shopping list`;
  }

  const handleBackendUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      let updatedItems = null;
      if (actionType === 'open' && (catBehavior === 2 || catBehavior === 3) && item.opened) {
        const res = await axios.put(`/inventory/${item.id}/split`, { openQuantity: 1 });
        updatedItems = res.data;
      } else if (actionType === 'open') {
        if (quantity >= item.quantity) {
          await axios.delete(`/inventory/${item.id}`);
          updatedItems = [];
        } else {
          const res = await axios.put(`/inventory/${item.id}/split`, { openQuantity: quantity });
          updatedItems = res.data;
        }
      } else if (actionType === 'remove') {
        await axios.delete(`/inventory/${item.id}`);
        updatedItems = [];
      }
      if (updateInventoryItems && typeof updateInventoryItems === 'function') {
        updateInventoryItems(item, updatedItems || []);
      }
      console.log("MODAL CONFIRM", { quantity, addToList });
      onConfirm?.({ quantity, addToList });
      afterAction?.();
      onClose();
    } catch (err) {
      setError('Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  const showHowMany =
    (actionType === 'open' && maxQuantity > 1 && !((catBehavior === 2 || catBehavior === 3) && item.opened)) ||
    (actionType === 'remove' && maxQuantity > 1);

  const showExpiration = (catBehavior === 3 && item.opened && item.expiration);

  return (
    <div className="modal modal-open" aria-modal="true" tabIndex={0}>
      <div className="modal-box rounded-2xl border border-base-300 bg-primary-content shadow-xl">
        <h2 className="text-xl font-quicksand font-bold text-primary mb-2">
          {prompt}
        </h2>
        <div className="mb-3">
          <div className="font-nunito-sans mb-2 text-base-content">
            {item?.product?.name || item?.name} ({item?.quantity} {item?.unit})
            {typeof item?.price === 'number' ? (
              <span className="ml-2 text-base-content/70">(${item.price.toFixed(2)})</span>
            ) : null}
          </div>
          {showHowMany && (
            <div>
              <label className="block font-quicksand mb-1">
                How many?
              </label>
              <input
                type="range"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="range range-primary"
                step={1}
                disabled={loading}
              />
              <div className="mt-1 text-sm text-primary font-bold">
                {quantity} {item.unit}{quantity > 1 ? 's' : ''}
              </div>
            </div>
          )}
          {showExpiration && (
            <div className="mt-2 text-warning font-bold">
              {formatExpiration(item.expiration)}
            </div>
          )}
          {askAddToList && (
            <div className="form-control mt-4">
              <label className="cursor-pointer label">
                <span className="label-text font-quicksand">Also add to shopping list?</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary ml-2"
                  checked={addToList}
                  onChange={e => setAddToList(e.target.checked)}
                  disabled={loading}
                />
              </label>
            </div>
          )}
        </div>
        {error && <div className="alert alert-error mb-2">{error}</div>}
        <div className="modal-action space-x-2 flex justify-end">
          <button className="btn btn-outline btn-error" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn btn-primary${loading ? " loading" : ""}`}
            onClick={handleBackendUpdate}
            disabled={loading}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

ActionModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  actionType: PropTypes.oneOf(['open', 'remove', 'addToList']),
  item: PropTypes.object,
  maxQuantity: PropTypes.number,
  onConfirm: PropTypes.func,
  isExpired: PropTypes.bool,
  askAddToList: PropTypes.bool,
  afterAction: PropTypes.func,
  updateInventoryItems: PropTypes.func,
};

export default ActionModal;