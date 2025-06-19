import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import shoppingListService from '../../services/shoppingListService';

const EMPTY_ROW = {
  amount: 1,
  unit: '',
  name: '',
  notes: '',
  categoryId: '',   // Always the ID, not name
  storeId: '',      // Always the ID, not name
  productId: null,
};

const DEFAULT_ROWS = 7;

function AddShoppingListItemModal({ isOpen, onClose, categories, stores, products, onSuccess }) {
  const [rows, setRows] = useState(Array(DEFAULT_ROWS).fill().map(() => ({ ...EMPTY_ROW })));
  const [autoSelect, setAutoSelect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState(Array(DEFAULT_ROWS).fill([]));
  const inputRefs = useRef([]);

  // Reset rows/suggestions when modal is opened
  useEffect(() => {
    if (isOpen) {
      setRows(Array(DEFAULT_ROWS).fill().map(() => ({ ...EMPTY_ROW })));
      setSuggestions(Array(DEFAULT_ROWS).fill([]));
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle changes to any input cell in a row
  const handleChange = (idx, field, value) => {
    setRows(rows =>
      rows.map((row, i) =>
        i !== idx
          ? row
          : field === 'name'
            ? { ...row, name: value, productId: null } // Reset productId if user changes name
            : { ...row, [field]: value }
      )
    );

    // Autocomplete for product name
    if (field === 'name' && value.length >= 2) {
      const q = value.trim().toLowerCase();
      setSuggestions(suggestions =>
        suggestions.map((arr, i) =>
          i === idx
            ? products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8)
            : arr
        )
      );
    } else if (field === 'name') {
      setSuggestions(suggestions => suggestions.map((arr, i) => (i === idx ? [] : arr)));
    }
  };

  // When user picks a suggestion, fill row with product fields
  const handleSuggestionSelect = (idx, prod) => {
    setRows(rows =>
      rows.map((row, i) =>
        i === idx
          ? {
              ...row,
              name: prod.name,
              productId: prod.id,
              unit: prod.defaultUnit || '',
              categoryId: prod.categoryId || '',
              // Don't pre-fill store
            }
          : row
      )
    );
    setSuggestions(suggestions => suggestions.map((arr, i) => (i === idx ? [] : arr)));
    setTimeout(() => {
      inputRefs.current[`${idx}-unit`]?.focus();
    }, 0);
  };

  // Submits all filled rows to backend via service, then closes
  const handleSubmit = async () => {
    setError('');
    const toAdd = rows.filter(row => row.name && row.name.trim());
    if (!toAdd.length) {
      setError('Enter at least one item with a title.');
      return;
    }
    setLoading(true);
    try {
      await Promise.all(
        toAdd.map(row =>
          shoppingListService.addItem({
            name: row.name.trim(),
            productId: row.productId,
            quantity: row.amount,
            unit: row.unit || null,
            categoryId: row.categoryId || null,
            notes: row.notes || null,
            storeId: row.storeId || null,
          })
        )
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Failed to add items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- JSX ---
  return (
    <div className="modal modal-open" aria-modal="true" tabIndex={0}>
      <div className="modal-box max-w-[700px] border border-base-300 rounded-2xl bg-base-200 shadow-xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Add Items to Shopping List</h2>
          <button onClick={onClose} className="btn btn-sm btn-ghost">✕</button>
        </div>
        <table className="table w-full text-xs table-fixed">
          <thead>
            <tr>
              <th className="w-10">Amt</th>
              <th className="w-14">Unit</th>
              <th className="w-40">Title <span className="text-error">*</span></th>
              <th className="w-24">Notes</th>
              <th className="w-28">Category</th>
              <th className="w-28">Store</th>
              <th className="w-10 text-center">
                <input type="checkbox" className="checkbox checkbox-xs mx-auto"
                  checked={autoSelect}
                  onChange={e => setAutoSelect(e.target.checked)}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    type="number"
                    className="input input-xs input-bordered w-10"
                    min={1}
                    value={row.amount}
                    onChange={e => handleChange(idx, 'amount', Math.max(1, Number(e.target.value)))}
                    placeholder="#"
                  />
                </td>
                <td>
                  <input
                    ref={el => (inputRefs.current[`${idx}-unit`] = el)}
                    type="text"
                    className="input input-xs input-bordered w-12"
                    value={row.unit}
                    onChange={e => handleChange(idx, 'unit', e.target.value)}
                    placeholder="Unit"
                  />
                </td>
                <td className="relative">
                  <input
                    type="text"
                    className="input input-xs input-bordered w-full"
                    value={row.name}
                    onChange={e => handleChange(idx, 'name', e.target.value)}
                    placeholder="Title (required)"
                    autoComplete="off"
                  />
                  {/* Product suggestions dropdown */}
                  {suggestions[idx]?.length > 0 && (
                    <ul className="absolute z-20 left-0 right-0 bg-base-100 border border-base-300 rounded shadow max-h-28 overflow-y-auto text-xs">
                      {suggestions[idx].map(prod => (
                        <li
                          key={prod.id}
                          className="px-2 py-1 hover:bg-primary/20 cursor-pointer"
                          onClick={() => handleSuggestionSelect(idx, prod)}
                        >
                          {prod.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td>
                  <input
                    type="text"
                    className="input input-xs input-bordered w-full"
                    value={row.notes}
                    onChange={e => handleChange(idx, 'notes', e.target.value)}
                    placeholder="Notes"
                  />
                </td>
                <td>
                  <select
                    className="select select-xs select-bordered w-full"
                    value={row.categoryId}
                    onChange={e => handleChange(idx, 'categoryId', e.target.value)}
                  >
                    <option value="">Category...</option>
                    {categories.map(cat => (
                      <option value={cat.id} key={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="select select-xs select-bordered w-full"
                    value={row.storeId}
                    onChange={e => handleChange(idx, 'storeId', e.target.value)}
                  >
                    <option value="">Store...</option>
                    {stores.map(store => (
                      <option value={store.id} key={store.id}>{store.name}</option>
                    ))}
                  </select>
                </td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
        {error && <div className="alert alert-error mt-3">{error}</div>}
        <div className="modal-action mt-4 flex justify-end gap-2">
          <button className="btn btn-outline btn-error" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn btn-primary${loading ? " loading" : ""}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            Add Items
          </button>
        </div>
      </div>
    </div>
  );
}

AddShoppingListItemModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  categories: PropTypes.array.isRequired,
  stores: PropTypes.array.isRequired,
  products: PropTypes.array.isRequired,
  onSuccess: PropTypes.func,
};

export default AddShoppingListItemModal;