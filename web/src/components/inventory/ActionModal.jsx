import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from '../../utils/axiosInstance';

/**
 * ActionModal is used for "Open" and "Remove" actions on inventory items.
 * - For Category 1: always "Open" (decrements count or removes row).
 * - For Category 2: "Open" if not already opened; "Remove" if already opened (must remove before opening another).
 */
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

  // Prompt logic: switch to "Remove" if already opened (Category 2)
  let prompt;
  if (actionType === 'open') {
    if (item.product?.inventoryBehavior === 2 && item.opened) {
      prompt = 'Remove from inventory';
    } else {
      prompt = `Open/use item${maxQuantity > 1 ? 's' : ''}`;
    }
  } else if (actionType === 'remove') {
    prompt = `Remove from inventory`;
  } else if (actionType === 'addToList') {
    prompt = `Add to shopping list`;
  }

  // Handle the backend update per the Category logic
  const handleBackendUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      let updatedItems = null;
      // Category 2 "Remove": treat as split with openQuantity=1 on an opened item
      if (actionType === 'open' && item.product?.inventoryBehavior === 2 && item.opened) {
        const res = await axios.put(`/inventory/${item.id}/split`, { openQuantity: 1 });
        updatedItems = res.data;
      } else if (actionType === 'open') {
        // Normal open for unopened (Category 1/2)
        if (quantity >= item.quantity) {
          await axios.delete(`/inventory/${item.id}`);
          updatedItems = [];
        } else {
          const res = await axios.put(`/inventory/${item.id}/split`, { openQuantity: quantity });
          updatedItems = res.data;
        }
      } else if (actionType === 'remove') {
        // Explicit remove: used for expired, etc.
        await axios.delete(`/inventory/${item.id}`);
        updatedItems = [];
      }
      if (updateInventoryItems && typeof updateInventoryItems === 'function') {
        updateInventoryItems(item, updatedItems || []);
      }
      onConfirm?.({ quantity, addToList });
      afterAction?.();
      onClose();
    } catch (err) {
      setError('Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  // Show "how many?" for open (if unopened, >1), but never for opened "Remove"
  const showHowMany =
    (actionType === 'open' && maxQuantity > 1 && !(item.product?.inventoryBehavior === 2 && item.opened)) ||
    (actionType === 'remove' && maxQuantity > 1);

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