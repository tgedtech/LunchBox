import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function ActionModal({
  isOpen,
  onClose,
  actionType,
  item,
  maxQuantity,
  onConfirm,
  isExpired = false,
  askAddToList = false,
}) {
  const [quantity, setQuantity] = useState(1);
  const [addToList, setAddToList] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setAddToList(false);
    }
  }, [isOpen]);

  if (!isOpen) return null; // Only render modal when open

  let prompt;
  if (actionType === 'open') {
    prompt = `Open/use item${maxQuantity > 1 ? 's' : ''}`;
  } else if (actionType === 'remove') {
    prompt = `Remove from inventory`;
  } else if (actionType === 'addToList') {
    prompt = `Add to shopping list`;
  }

  return (
    <div className="modal modal-open" aria-modal="true" tabIndex={0}>
      <div className="modal-box rounded-2xl border border-base-300 bg-primary-content shadow-xl">
        <h2 className="text-xl font-quicksand font-bold text-primary mb-2">
          {prompt}
        </h2>
        <div className="mb-3">
          <div className="font-nunito-sans mb-2 text-base-content">
            {item?.product?.name || item?.name} ({item?.quantity} {item?.unit})
          </div>
          {(actionType === 'open' || actionType === 'remove') && maxQuantity > 1 && (
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
                />
              </label>
            </div>
          )}
        </div>
        <div className="modal-action space-x-2 flex justify-end">
          <button className="btn btn-outline btn-error" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              onConfirm({
                quantity,
                addToList: askAddToList ? addToList : undefined,
              })
            }
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
};

export default ActionModal;