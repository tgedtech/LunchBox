import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import CreatableSelect from 'react-select/creatable';

/**
 * AddMasterDataModal
 * Generic modal for adding Products, Categories, Locations, Units, or Stores
 * Supports inline creation of categories, locations, and units via CreatableSelect.
 */
function AddMasterDataModal({
  isOpen,
  onClose,
  onSuccess,
  type,
  categories = [],
  locations = [],
  units = [],
  existingItems = [],
}) {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [nameError, setNameError] = useState('');
  const [apiError, setApiError] = useState('');

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

  const getEndpoint = () => {
    switch (type) {
      case 'Product': return '/products';
      case 'Category': return '/categories';
      case 'Location': return '/locations';
      case 'Unit': return '/units';
      case 'Store': return '/stores';
      default: return '';
    }
  };

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

  /**
   * Save handler:
   * - For Products, supports on-the-fly creation of category/location/unit
   * - Runs case-insensitive duplicate validation before POST
   * - Posts the final product/category/location/unit/store to the API
   */
  const handleSave = async () => {
    setApiError('');

    if (!name.trim()) {
      setNameError(`${type} name is required`);
      return;
    }
    if (nameError) return;

    try {
      // Compose payload for POST
      const payload = { name: name.trim() };

      if (type === 'Product') {
        // --- Resolve category (create if new)
        let catId = selectedCategory?.value || null;
        if (selectedCategory?.__isNew__ && selectedCategory.label) {
          const res = await axios.post('/categories', { name: selectedCategory.label.trim() });
          catId = res.data.id;
          setSelectedCategory({ value: catId, label: res.data.name });
        }

        // --- Resolve location (create if new)
        let locId = selectedLocation?.value || null;
        if (selectedLocation?.__isNew__ && selectedLocation.label) {
          const res = await axios.post('/locations', { name: selectedLocation.label.trim() });
          locId = res.data.id;
          setSelectedLocation({ value: locId, label: res.data.name });
        }

        // --- Resolve unit (create if new)
        let unitId = selectedUnit?.value || null;
        if (selectedUnit?.__isNew__ && selectedUnit.label) {
          const res = await axios.post('/units', { name: selectedUnit.label.trim() });
          unitId = res.data.id;
          setSelectedUnit({ value: unitId, label: res.data.name });
        }

        // Assign correct field names for schema:
        payload.categoryId = catId || null;
        payload.defaultLocationId = locId || null;
        payload.defaultUnitTypeId = unitId || null;
      }

      // POST to appropriate endpoint
      await axios.post(getEndpoint(), payload);

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error(`Error adding ${type}:`, err);
      if (
        err?.response?.data?.code === 'P2002' ||
        (err?.response?.data?.message?.toLowerCase?.() || '').includes('unique constraint')
      ) {
        setNameError(`A ${type.toLowerCase()} with this name already exists.`);
      } else {
        setApiError(`Failed to add ${type}`);
      }
    }
  };

  return (
    <>
      {/* Modal visibility control (DaisyUI pattern) */}
      <input
        type="checkbox"
        id="add-masterdata-modal"
        className="modal-toggle"
        checked={isOpen}
        readOnly
      />
      <div className="modal">
        <div className="modal-box rounded-2xl border border-base-300 bg-primary-content shadow-xl">
          {/* Modal Title */}
          <h2 className="text-xl font-quicksand font-bold text-primary mb-4">
            Add {type}
          </h2>

          {/* API Error (not validation) */}
          {apiError && (
            <div className="alert alert-error mb-4">
              <span>{apiError}</span>
            </div>
          )}

          {/* --- Name field (all types) --- */}
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

          {/* --- Product Extras: CreatableSelect for Category/Location/Unit --- */}
          {type === 'Product' && (
            <>
              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1 font-quicksand">
                  Category
                </label>
                <CreatableSelect
                  styles={selectStyle}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="Enter or select category"
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  formatCreateLabel={inputValue => `Create "${inputValue}"`}
                />
              </div>
              {/* Default Location */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1 font-quicksand">
                  Default Location
                </label>
                <CreatableSelect
                  styles={selectStyle}
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  options={locations.map(l => ({ value: l.id, label: l.name }))}
                  placeholder="Enter or select location"
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  formatCreateLabel={inputValue => `Create "${inputValue}"`}
                />
              </div>
              {/* Default Unit */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1 font-quicksand">
                  Default Unit
                </label>
                <CreatableSelect
                  styles={selectStyle}
                  value={selectedUnit}
                  onChange={setSelectedUnit}
                  options={units.map(u => ({ value: u.id, label: u.name }))}
                  placeholder="Enter or select unit"
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  formatCreateLabel={inputValue => `Create "${inputValue}"`}
                />
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