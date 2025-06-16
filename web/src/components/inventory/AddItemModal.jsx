import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from '../../utils/axiosInstance';

// Utility: always normalize select value to { value: id, label: name }
function getOptionByValue(val, arr) {
  if (!val) return null;
  if (typeof val === 'object' && val.value) return val;
  // Try to match by id (uuid) or by name (legacy/edge case)
  const found = arr.find(a => a.id === val || a.name === val);
  return found ? { value: found.id, label: found.name } : null;
}

function AddItemModal({
  isOpen,
  onClose,
  onSuccess,
  products = [],
  categories = [],
  locations = [],
  stores = [],
  units = [],
  existingItems = [],
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [expiration, setExpiration] = useState('');

  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setQuantity(1);
      setSelectedCategory(null);
      setSelectedLocation(null);
      setSelectedStore(null);
      setSelectedUnit(null);
      setExpiration('');
      setError('');
      setApiError('');
    }
  }, [isOpen]);

  const handleProductChange = (newValue) => {
    setSelectedProduct(getOptionByValue(newValue, products));

    if (newValue?.__isNew__ && existingItems.length > 0) {
      const trimmed = newValue.label.trim().toLowerCase();
      const duplicate = existingItems.some(
        (item) => (item.name || '').trim().toLowerCase() === trimmed
      );
      if (duplicate) {
        setError('A product with this name already exists.');
        return;
      }
    }

    if (!newValue?.__isNew__) {
      const existing = products.find((p) => p.id === newValue?.value);
      if (existing) {
        setSelectedCategory(existing.category ? { value: existing.category.id, label: existing.category.name } : null);
        setSelectedLocation(existing.defaultLocation ? { value: existing.defaultLocation.id, label: existing.defaultLocation.name } : null);
        setSelectedUnit(existing.defaultUnitType ? { value: existing.defaultUnitType.id, label: existing.defaultUnitType.name } : null);
      } else {
        setSelectedCategory(null);
        setSelectedLocation(null);
        setSelectedUnit(null);
      }
    } else {
      setSelectedCategory(null);
      setSelectedLocation(null);
      setSelectedUnit(null);
    }
    setError('');
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
      boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
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

  // Always resolve the .value to a valid UUID for POSTs
  function getIdFromSelect(val, arr) {
    if (!val) return null;
    if (typeof val === 'object' && val.value) return val.value;
    const found = arr.find((item) => item.name === val || item.id === val);
    return found ? found.id : null;
  }

  const handleSave = async () => {
    setApiError('');
    setError('');

    if (!selectedProduct || !selectedProduct.label?.trim()) {
      setError('Product name is required');
      return;
    }

    try {
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

      let storeId = getIdFromSelect(selectedStore, stores);
      if (selectedStore?.__isNew__ && selectedStore.label) {
        const res = await axios.post('/stores', { name: selectedStore.label.trim() });
        storeId = res.data.id;
        setSelectedStore({ value: storeId, label: res.data.name });
      }

      let unitId = getIdFromSelect(selectedUnit, units);
      if (selectedUnit?.__isNew__ && selectedUnit.label) {
        const res = await axios.post('/units', { name: selectedUnit.label.trim() });
        unitId = res.data.id;
        setSelectedUnit({ value: unitId, label: res.data.name });
      }

      let productId;
      if (selectedProduct?.__isNew__) {
        const productRes = await axios.post('/products', {
          name: selectedProduct.label.trim(),
          categoryId: catId,
          defaultLocationId: locId,
          defaultUnitTypeId: unitId,
        });
        productId = productRes.data.id;
        setSelectedProduct({ value: productRes.data.id, label: productRes.data.name });
      } else {
        productId = getIdFromSelect(selectedProduct, products);
      }

      await axios.post('/inventory', {
        productId,
        locationId: locId,
        unit: selectedUnit?.label || '',
        quantity,
        expiration: expiration ? new Date(expiration).toISOString() : null,
        opened: false,
      });

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding item:', err);
      setApiError('Failed to add item');
    }
  };

  return (
    <>
      <input type="checkbox" id="add-item-modal" className="modal-toggle" checked={isOpen} readOnly />
      <div className="modal">
        <div className="modal-box rounded-2xl border border-base-300 bg-primary-content shadow-xl">
          <h2 className="text-xl font-quicksand font-bold text-primary mb-4">
            Add Item
          </h2>

          {apiError && (
            <div className="alert alert-error mb-4">
              <span>{apiError}</span>
            </div>
          )}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-bold mb-1 font-quicksand">Product Name</label>
            <CreatableSelect
              styles={selectStyle}
              value={selectedProduct}
              onChange={handleProductChange}
              options={products.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Enter or select product"
              isClearable
              menuPortalTarget={document.body}
              menuPosition="fixed"
              formatCreateLabel={inputValue => `Create "${inputValue}"`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1 font-quicksand">Quantity</label>
            <input
              type="number"
              min={1}
              className="input input-bordered w-full font-nunito-sans"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1 font-quicksand">Category</label>
            <CreatableSelect
              styles={selectStyle}
              value={selectedCategory}
              onChange={v => setSelectedCategory(getOptionByValue(v, categories))}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Enter or select category"
              isClearable
              menuPortalTarget={document.body}
              menuPosition="fixed"
              formatCreateLabel={inputValue => `Create "${inputValue}"`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1 font-quicksand">Location</label>
            <CreatableSelect
              styles={selectStyle}
              value={selectedLocation}
              onChange={v => setSelectedLocation(getOptionByValue(v, locations))}
              options={locations.map((l) => ({ value: l.id, label: l.name }))}
              placeholder="Enter or select location"
              isClearable
              menuPortalTarget={document.body}
              menuPosition="fixed"
              formatCreateLabel={inputValue => `Create "${inputValue}"`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1 font-quicksand">Store</label>
            <CreatableSelect
              styles={selectStyle}
              value={selectedStore}
              onChange={v => setSelectedStore(getOptionByValue(v, stores))}
              options={stores.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Enter or select store"
              isClearable
              menuPortalTarget={document.body}
              menuPosition="fixed"
              formatCreateLabel={inputValue => `Create "${inputValue}"`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1 font-quicksand">Unit</label>
            <CreatableSelect
              styles={selectStyle}
              value={selectedUnit}
              onChange={v => setSelectedUnit(getOptionByValue(v, units))}
              options={units.map((u) => ({ value: u.id, label: u.name }))}
              placeholder="Enter or select unit"
              isClearable
              menuPortalTarget={document.body}
              menuPosition="fixed"
              formatCreateLabel={inputValue => `Create "${inputValue}"`}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-1 font-quicksand">
              Expiration Date (optional)
            </label>
            <input
              type="date"
              className="input input-bordered w-full font-nunito-sans"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6 font-nunito-sans">
            <button className="btn btn-outline btn-error" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!!error || !selectedProduct || !selectedProduct.label?.trim()}
            >
              Save Item
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddItemModal;