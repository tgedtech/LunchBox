import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

/**
 * Generic modal for adding master data (Products, Categories, Locations, Units, Stores)
 * Handles real-time, case-insensitive duplicate validation.
 *
 * Props:
 *   isOpen        (bool): Controls modal visibility
 *   onClose       (func): Called to close modal
 *   onSuccess     (func): Called after successful save
 *   type          (string): Entity type ("Product", "Category", etc.)
 *   categories    (array): [Products only] List of categories for dropdown
 *   locations     (array): [Products only] List of locations for dropdown
 *   units         (array): [Products only] List of units for dropdown
 *   existingItems (array): List of already-existing entities to check for duplicates
 */
function AddMasterDataModal({
  isOpen,
  onClose,
  onSuccess,
  type,
  categories = [],
  locations = [],
  units = [],
  existingItems = []
}) {
  // --- State for form fields ---
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // --- State for validation and API errors ---
  const [nameError, setNameError] = useState('');
  const [apiError, setApiError] = useState('');

  // --- Reset state every time modal opens ---
  useEffect(() => {
    if (isOpen) {
      setName('');
      setSelectedCategory(null);
      setSelectedLocation(null);
      setSelectedUnit(null);
      setNameError('');
      setApiError('');
    }
  }, [isOpen]);

  /**
   * Real-time, case-insensitive, trimmed duplicate check
   * Blocks duplicate "name" for this master data type.
   */
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);

    const trimmed = val.trim().toLowerCase();
    const duplicate = existingItems.some(
      (item) => (item.name || '').trim().toLowerCase() === trimmed
    );
    if (duplicate) {
      setNameError(`A ${type.toLowerCase()} with this name already exists.`);
    } else {
      setNameError('');
    }
  };

  /**
   * Determine correct API endpoint for this entity type
   */
  const getEndpoint = () => {
    switch (type) {
      case 'Product':   return '/products';
      case 'Category':  return '/categories';
      case 'Location':  return '/locations';
      case 'Unit':      return '/units';
      case 'Store':     return '/stores';
      default:          return '';
    }
  };

  /**
   * Save handler:
   * - Validates locally (no empty, no duplicate)
   * - Sends to correct endpoint
   * - Passes through additional fields for Product only
   * - Handles all API and validation errors
   */
  const handleSave = async () => {
    setApiError('');

    if (!name.trim()) {
      setNameError(`${type} name is required`);
      return;
    }
    if (nameError) return;

    try {
      const payload = { name: name.trim() };

      // Product requires extra fields
      if (type === 'Product') {
        payload.categoryId = selectedCategory?.value || null;
        payload.defaultLocationId = selectedLocation?.value || null;
        payload.defaultUnitId = selectedUnit?.value || null;
      }

      await axios.post(getEndpoint(), payload);

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error(`Error adding ${type}:`, err);
      // Surface duplicate error if API failed anyway
      if (
        err?.response?.data?.code === 'P2002' ||
        err?.response?.data?.message?.toLowerCase().includes('unique constraint')
      ) {
        setNameError(`A ${type.toLowerCase()} with this name already exists.`);
      } else {
        setApiError(`Failed to add ${type}`);
      }
    }
  };

  // --- Styling for select controls (if used for Product) ---
  const selectStyle = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#f9fafb',
      borderColor: state.isFocused ? '#60a5fa' : '#d1d5db',
      boxShadow: 'none',
      borderRadius: '0.5rem',
      minHeight: '2.5rem',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: '#60a5fa' },
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      marginTop: '4px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#f3f4f6' : '#ffffff',
      color: '#111827',
      cursor: 'pointer',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#111827',
    }),
  };

  return (
    <>
      <input
        type="checkbox"
        id="add-masterdata-modal"
        className="modal-toggle"
        checked={isOpen}
        readOnly
      />
      <div className="modal">
        <div className="modal-box rounded-2xl border border-base-300 bg-primary-content shadow-xl">
          <h2 className="text-xl font-quicksand font-bold text-primary mb-4">
            Add {type}
          </h2>

          {/* API error (not validation) */}
          {apiError && (
            <div className="alert alert-error mb-4">
              <span>{apiError}</span>
            </div>
          )}

          {/* --- Name field (required for all types) --- */}
          <div className="mb-4">
            <label className="block text-sm mb-1 font-quicksand font-bold text-primary">
              {type} Name
            </label>
            <input
              type="text"
              className={`input input-bordered bg-neutral-content w-full font-nunito-sans ${nameError ? 'input-error validator' : ''}`}
              value={name}
              onChange={handleNameChange}
              placeholder={`Enter ${type.toLowerCase()} name`}
              aria-invalid={!!nameError}
            />
            {nameError && (
              <p className="validator-hint text-error text-xs mt-1">
                {nameError}
              </p>
            )}
          </div>

          {/* --- Product extras: Category, Location, Unit dropdowns --- */}
          {type === 'Product' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1 font-quicksand">
                  Category
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedCategory?.value || ''}
                  onChange={e => {
                    const found = categories.find(c => c.id === e.target.value);
                    setSelectedCategory(
                      found ? { value: found.id, label: found.name } : null
                    );
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1 font-quicksand">
                  Default Location
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedLocation?.value || ''}
                  onChange={e => {
                    const found = locations.find(l => l.id === e.target.value);
                    setSelectedLocation(
                      found ? { value: found.id, label: found.name } : null
                    );
                  }}
                >
                  <option value="">Select location</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1 font-quicksand">
                  Default Unit
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedUnit?.value || ''}
                  onChange={e => {
                    const found = units.find(u => u.id === e.target.value);
                    setSelectedUnit(
                      found ? { value: found.id, label: found.name } : null
                    );
                  }}
                >
                  <option value="">Select unit</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* --- Action buttons --- */}
          <div className="flex justify-end space-x-2 mt-6 font-nunito-sans">
            <button className="btn btn-outline btn-error" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!!nameError || !name.trim()}
            >
              Save {type}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddMasterDataModal;