import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import CreatableSelect from 'react-select/creatable';

// Utility: normalize select value
function getOptionByValue(val, arr) {
  if (!val) return null;
  if (typeof val === 'object' && val.value) return val;
  const found = arr.find(a => a.id === val || a.name === val);
  return found ? { value: found.id, label: found.name } : null;
}

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
    // (same as before)
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

  // Always resolve to ID for POSTs
  function getIdFromSelect(val, arr) {
    if (!val) return null;
    if (typeof val === 'object' && val.value) return val.value;
    const found = arr.find((item) => item.name === val || item.id === val);
    return found ? found.id : null;
  }

  const handleSave = async () => {
    setApiError('');

    if (!name.trim()) {
      setNameError(`${type} name is required`);
      return;
    }
    if (nameError) return;

    try {
      const payload = { name: name.trim() };

      if (type === 'Product') {
        let catId = getIdFromSelect(selectedCategory, categories);
        if (selectedCategory?.__isNew__ && selectedCategory.label) {
          const res = await axios.post('/categories', { name: selectedCategory.label.trim() });
          catId = res.data.id;
          setSelectedCategory({ value: catId, label: res.data.name });
        }

        let locId = getIdFromSelect(selectedLocation, locations);
        if (selectedLocation?.__isNew__ && selectedLocation.label) {
          const res = await axios.post('/locations', { name: selectedLocation.label.trim() });
          locId = res.data.id;
          setSelectedLocation({ value: locId, label: res.data.name });
        }

        let unitId = getIdFromSelect(selectedUnit, units);
        if (selectedUnit?.__isNew__ && selectedUnit.label) {
          const res = await axios.post('/units', { name: selectedUnit.label.trim() });
          unitId = res.data.id;
          setSelectedUnit({ value: unitId, label: res.data.name });
        }

        payload.categoryId = catId || null;
        payload.defaultLocationId = locId || null;
        payload.defaultUnitTypeId = unitId || null;
      }

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
          {apiError && (
            <div className="alert alert-error mb-4">
              <span>{apiError}</span>
            </div>
          )}
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
          {type === 'Product' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1 font-quicksand">
                  Category
                </label>
                <CreatableSelect
                  styles={selectStyle}
                  value={selectedCategory}
                  onChange={v => setSelectedCategory(getOptionByValue(v, categories))}
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="Enter or select category"
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  formatCreateLabel={inputValue => `Create "${inputValue}"`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1 font-quicksand">
                  Default Location
                </label>
                <CreatableSelect
                  styles={selectStyle}
                  value={selectedLocation}
                  onChange={v => setSelectedLocation(getOptionByValue(v, locations))}
                  options={locations.map(l => ({ value: l.id, label: l.name }))}
                  placeholder="Enter or select location"
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  formatCreateLabel={inputValue => `Create "${inputValue}"`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1 font-quicksand">
                  Default Unit
                </label>
                <CreatableSelect
                  styles={selectStyle}
                  value={selectedUnit}
                  onChange={v => setSelectedUnit(getOptionByValue(v, units))}
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