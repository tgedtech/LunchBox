import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import shoppingListService from '../../services/shoppingListService';
import StepperInput from '../common/StepperInput';

const EMPTY_ROW = {
  amount: 1,
  unit: '',
  name: '',
  notes: '',
  categoryId: '',
  storeId: '',
  productId: null,
  // track if the unit/category was manually changed
  _unitManual: false,
  _categoryManual: false,
};

const DEFAULT_ROWS = 7;

function AddShoppingListItemModal({ isOpen, onClose, categories, stores, products, onSuccess }) {
  const [rows, setRows] = useState(Array(DEFAULT_ROWS).fill().map(() => ({ ...EMPTY_ROW })));
  const [autoSelect, setAutoSelect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState(Array(DEFAULT_ROWS).fill([]));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setRows(Array(DEFAULT_ROWS).fill().map(() => ({ ...EMPTY_ROW })));
      setSuggestions(Array(DEFAULT_ROWS).fill([]));
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // === Helper: Find product by name or id ===
  const findProduct = (val) =>
    products.find(
      (p) => p.id === val || p.name.trim().toLowerCase() === (val || '').trim().toLowerCase()
    );

  // === Main handler for input changes ===
  const handleChange = (idx, field, value) => {
    setRows(rows =>
      rows.map((row, i) => {
        if (i !== idx) return row;

        // Typing product name always clears the productId, disables autofill unless suggestion is picked
        if (field === 'name') {
          // Show suggestions if at least 2 chars, else clear
          if (value.length >= 2) {
            const q = value.trim().toLowerCase();
            setSuggestions(suggestions =>
              suggestions.map((arr, j) =>
                j === idx
                  ? products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8)
                  : arr
              )
            );
          } else {
            setSuggestions(suggestions => suggestions.map((arr, j) => (j === idx ? [] : arr)));
          }
          return {
            ...row,
            name: value,
            productId: null,
            // If user types, don't overwrite their previous manual unit/category changes
            // _unitManual/categoryManual remains the same
          };
        }

        // Manual override for unit/category
        if (field === 'unit') {
          return { ...row, unit: value, _unitManual: true };
        }
        if (field === 'categoryId') {
          return { ...row, categoryId: value, _categoryManual: true };
        }

        // Normal update for other fields
        return { ...row, [field]: value };
      })
    );
  };

  // === User selects a suggestion: autofill unit/category, but only if user hasn't manually overridden ===
  const handleSuggestionSelect = (idx, prod) => {
    setRows(rows =>
      rows.map((row, i) => {
        if (i !== idx) return row;
        // Autofill unit/category only if NOT manually set by user
        return {
          ...row,
          name: prod.name,
          productId: prod.id,
          unit: row._unitManual
            ? row.unit
            : prod.defaultUnitType?.name ||
            prod.defaultUnit || // fallback for string field
            '',
          categoryId: row._categoryManual
            ? row.categoryId
            : prod.category?.id || '',
          // Retain flags so future manual change is respected
        };
      })
    );
    setSuggestions(suggestions => suggestions.map((arr, i) => (i === idx ? [] : arr)));
    setTimeout(() => {
      inputRefs.current[`${idx}-unit`]?.focus();
    }, 0);
  };

  // === Form submission: filter out empty, send to API ===
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

  return (
    <div className="modal modal-open" aria-modal="true" tabIndex={0}>
      <div className="modal-box max-w-[700px] border border-base-300 rounded-2xl bg-base-200 shadow-xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold font-quicksand">Add Items to Shopping List</h2>
          <button onClick={onClose} className="btn btn-sm btn-ghost">✕</button>
        </div>
        <table className="table w-full table-xs table-fixed">
          <thead className='font-quicksand text-base-content font-bold'>
            <tr>
              <th className="w-4 p-0"></th>
              <th className="w-10 px-1">Amt</th>
              <th className="w-40 px-1">Title <span className="text-error">*</span></th>
              <th className="w-20 px-1">Unit</th>
              <th className="w-24 px-1">Notes</th>
              <th className="w-20 px-1">Category</th>
              <th className="w-20 px-1">Store</th>
            </tr>
          </thead>
          <tbody className="font-nunito-sans text-base-content">
            {rows.map((row, idx) => (
              <tr key={idx} className="gap-x-1">
                {/* Row number */}
                <td className="p-0 text-center text-xs">{idx + 1}</td>
                {/* Amount */}
                <td className="px-1">
                  <input
                    type="number"
                    min={1}
                    className="input input-xs input-bordered w-full"
                    value={row.amount}
                    onChange={e => handleChange(idx, 'amount', Math.max(1, Number(e.target.value)))}
                    placeholder="#"
                  />
                </td>
                {/* Item Title with autocomplete */}
                <td className="relative px-1">
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
                    <ul className="absolute z-30 left-0 right-0 bg-base-100 border border-base-300 rounded shadow max-h-28 overflow-y-auto text-xs">
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
                {/* Unit */}
                <td className="px-1">
                  <input
                    type="text"
                    className="input input-xs input-bordered w-full"
                    value={row.unit}
                    ref={el => (inputRefs.current[`${idx}-unit`] = el)}
                    onChange={e => handleChange(idx, 'unit', e.target.value)}
                    placeholder="Unit"
                  />
                </td>
                {/* Notes */}
                <td className="px-1">
                  <input
                    type="text"
                    className="input input-xs input-bordered w-full"
                    value={row.notes}
                    onChange={e => handleChange(idx, 'notes', e.target.value)}
                    placeholder="Notes"
                  />
                </td>
                {/* Category */}
                <td className="px-1">
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
                {/* Store */}
                <td className="px-1">
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