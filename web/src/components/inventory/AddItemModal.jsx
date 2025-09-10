import React, { useEffect, useMemo, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from '../../utils/axiosInstance';
import StepperInput from '../common/StepperInput';

function getOptionByValue(val, arr) {
  if (!val) return null;
  if (typeof val === 'object' && val.value) return val;
  const found = arr.find(a => a.id === val || a.name === val);
  return found ? { value: found.id, label: found.name } : null;
}

const INVENTORY_BEHAVIOR_OPTIONS = [
  { value: 1, label: 'Remove from Inventory Once Open' },
  { value: 2, label: 'Keeps for a Long Time Once Open' },
  { value: 3, label: 'Goes Bad Once Open' },
];

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
  refreshMasterData,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // PRICE: new inputs
  const [priceInput, setPriceInput] = useState('');
  const [priceBasis, setPriceBasis] = useState('TOTAL'); // 'TOTAL' | 'PER_UNIT'

  const [expiration, setExpiration] = useState('');
  const [inventoryBehavior, setInventoryBehavior] = useState(1);
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setQuantity('1');
      setSelectedCategory(null);
      setSelectedLocation(null);
      setSelectedStore(null);
      setSelectedUnit(null);
      setPriceInput('');
      setPriceBasis('TOTAL');
      setExpiration('');
      setInventoryBehavior(1);
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
        setInventoryBehavior(Number(existing.inventoryBehavior) || 1);
      } else {
        setSelectedCategory(null);
        setSelectedLocation(null);
        setSelectedUnit(null);
        setInventoryBehavior(1);
      }
    } else {
      setSelectedCategory(null);
      setSelectedLocation(null);
      setSelectedUnit(null);
      setInventoryBehavior(1);
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
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
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
    placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
    singleValue: (provided) => ({ ...provided, color: '#111827' }),
  };

  function getIdFromSelect(val, arr) {
    if (!val) return null;
    if (typeof val === 'object' && val.value) return val.value;
    const found = arr.find((item) => item.name === val || item.id === val);
    return found ? found.id : null;
  }

  // ---- Pricing calculations ----
  const qtyNum = useMemo(() => {
    const n = Number(quantity);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [quantity]);

  const priceNum = useMemo(() => {
    const n = Number(priceInput);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [priceInput]);

  const priceComputed = useMemo(() => {
    if (!qtyNum) return { priceTotal: 0, pricePerUnit: 0 };
    if (priceBasis === 'TOTAL') {
      const priceTotal = priceNum;
      const pricePerUnit = qtyNum ? priceTotal / qtyNum : 0;
      return { priceTotal, pricePerUnit };
    } else {
      const pricePerUnit = priceNum;
      const priceTotal = pricePerUnit * qtyNum;
      return { priceTotal, pricePerUnit };
    }
  }, [priceBasis, priceNum, qtyNum]);

  const handleSave = async () => {
    setApiError('');
    setError('');

    if (!selectedProduct || !selectedProduct.label?.trim()) {
      setError('Product name is required');
      return;
    }
    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }
    if (priceInput && isNaN(Number(priceInput))) {
      setError('Price must be a valid number');
      return;
    }

    try {
      let catId = getIdFromSelect(selectedCategory, categories);
      if (selectedCategory?.__isNew__ && selectedCategory.label) {
        const res = await axios.post('/categories', { name: selectedCategory.label.trim() });
        catId = res.data.id;
        setSelectedCategory({ value: catId, label: res.data.name });
        if (typeof refreshMasterData === 'function') refreshMasterData();
      }

      let locId = getIdFromSelect(selectedLocation, locations);
      if (selectedLocation?.__isNew__ && selectedLocation.label) {
        const res = await axios.post('/locations', { name: selectedLocation.label.trim() });
        locId = res.data.id;
        setSelectedLocation({ value: locId, label: res.data.name });
        if (typeof refreshMasterData === 'function') refreshMasterData();
      }

      let storeId = getIdFromSelect(selectedStore, stores);
      if (selectedStore?.__isNew__ && selectedStore.label) {
        const res = await axios.post('/stores', { name: selectedStore.label.trim() });
        storeId = res.data.id;
        setSelectedStore({ value: storeId, label: res.data.name });
        if (typeof refreshMasterData === 'function') refreshMasterData();
      }

      let unitId = getIdFromSelect(selectedUnit, units);
      if (selectedUnit?.__isNew__ && selectedUnit.label) {
        const res = await axios.post('/units', { name: selectedUnit.label.trim() });
        unitId = res.data.id;
        setSelectedUnit({ value: unitId, label: res.data.name });
        if (typeof refreshMasterData === 'function') refreshMasterData();
      }

      let productId;
      if (selectedProduct?.__isNew__) {
        const productRes = await axios.post('/products', {
          name: selectedProduct.label.trim(),
          categoryId: catId,
          defaultLocationId: locId,
          defaultUnitTypeId: unitId,
          inventoryBehavior: Number(inventoryBehavior),
        });
        productId = productRes.data.id;
        setSelectedProduct({ value: productRes.data.id, label: productRes.data.name });
        if (typeof refreshMasterData === 'function') refreshMasterData();
      } else {
        productId = getIdFromSelect(selectedProduct, products);
        if (productId) {
          await axios.put(`/products/${productId}`, {
            inventoryBehavior: Number(inventoryBehavior),
            name: selectedProduct.label.trim(),
            categoryId: catId,
            defaultLocationId: locId,
            defaultUnitTypeId: unitId,
          });
          if (typeof refreshMasterData === 'function') refreshMasterData();
        }
      }

      // Build payload with new pricing fields.
      const pricePerUnit = Number(priceComputed.pricePerUnit.toFixed(4));
      const priceTotal = Number(priceComputed.priceTotal.toFixed(2));

      await axios.post('/inventory', {
        productId,
        locationId: locId,
        unit: selectedUnit?.label || '',
        quantity: Number(quantity),
        expiration: expiration ? new Date(expiration).toISOString() : null,
        opened: false,

        // NEW fields for the upcoming migration:
        priceBasis,
        pricePerUnit,
        priceTotal,

        // Legacy field for backward-compatibility:
        // we store per-unit here so the current UI shows price/item even before the migration lands.
        price: priceInput ? pricePerUnit : null,

        storeId,
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
        <div className="modal-box rounded-2xl border border-base-300 bg-base-100 shadow-xl">
          <h2 className="font-quicksand font-black text-xl text-base-content mb-4">Add Item</h2>
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
          {/* Product Name */}
          <label className="label font-quicksand font-black text-base-content">Product Name</label>
          <CreatableSelect
            styles={selectStyle}
            value={selectedProduct}
            onChange={handleProductChange}
            options={products.map((p) => ({ value: p.id, label: p.name }))}
            placeholder="Enter or Select a Product"
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
            formatCreateLabel={inputValue => `Create "${inputValue}"`}
          />

          {/* Quantity */}
          <label className="label font-quicksand font-black text-base-content mt-4">Quantity</label>
          <StepperInput
            value={quantity}
            onChange={setQuantity}
            min={1}
            inputClass="input bg-primary-content w-20"
          />

          {/* Category */}
          <label className="label font-quicksand font-black text-base-content mt-4">Category</label>
          <CreatableSelect
            styles={selectStyle}
            value={selectedCategory}
            onChange={v => setSelectedCategory(getOptionByValue(v, categories))}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select a Category"
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
            formatCreateLabel={inputValue => `Create "${inputValue}"`}
          />

          {/* Unit */}
          <label className="label font-quicksand font-black text-base-content mt-4">Unit</label>
          <CreatableSelect
            styles={selectStyle}
            value={selectedUnit}
            onChange={v => setSelectedUnit(getOptionByValue(v, units))}
            options={units.map((u) => ({ value: u.id, label: u.name }))}
            placeholder="How do you count this?"
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
            formatCreateLabel={inputValue => `Create "${inputValue}"`}
          />

          {/* Location */}
          <label className="label font-quicksand font-black text-base-content mt-4">Location</label>
          <CreatableSelect
            styles={selectStyle}
            value={selectedLocation}
            onChange={v => setSelectedLocation(getOptionByValue(v, locations))}
            options={locations.map((l) => ({ value: l.id, label: l.name }))}
            placeholder="Where do you store it?"
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
            formatCreateLabel={inputValue => `Create "${inputValue}"`}
          />

          {/* Store */}
          <label className="label font-quicksand font-black text-base-content mt-4">Store</label>
          <CreatableSelect
            styles={selectStyle}
            value={selectedStore}
            onChange={v => setSelectedStore(getOptionByValue(v, stores))}
            options={stores.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Where did you buy it?"
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
            formatCreateLabel={inputValue => `Create "${inputValue}"`}
          />

          {/* Price with basis toggle + live preview */}
          <label className="label font-quicksand font-black text-base-content mt-4">Price</label>
          <div className="p-3 rounded-box bg-base-200">
            <div className="flex items-end gap-3">
              <label className="form-control w-40">
                <span className="label-text">{priceBasis === 'TOTAL' ? 'Total Price' : 'Price per Item'}</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={priceBasis === 'TOTAL' ? 'e.g. 12.00' : 'e.g. 1.50'}
                  className="input bg-primary-content w-full"
                  value={priceInput}
                  onChange={e => setPriceInput(e.target.value)}
                />
              </label>

              <div className="form-control">
                <span className="label-text">Basis</span>
                <div className="join join-horizontal">
                  <button
                    type="button"
                    className={`btn btn-sm join-item ${priceBasis === 'TOTAL' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setPriceBasis('TOTAL')}
                  >
                    Total
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm join-item ${priceBasis === 'PER_UNIT' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setPriceBasis('PER_UNIT')}
                  >
                    Per item
                  </button>
                </div>
              </div>

              <div className="ml-auto text-sm">
                <div className="opacity-70">Preview</div>
                <div>
                  ${priceComputed.pricePerUnit.toFixed(2)} / {selectedUnit?.label || 'unit'} · Total ${priceComputed.priceTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Expiration */}
          <label className="label font-quicksand font-black text-base-content mt-4">Expiration or Best Buy Date</label>
          <input
            type="date"
            className="input bg-primary-content w-full"
            value={expiration}
            onChange={e => setExpiration(e.target.value)}
          />

          {/* Inventory Behavior (Radio Group) */}
          <label className="label font-quicksand font-black text-base-content mt-4">Inventory Options</label>
          <div className="join join-vertical w-full mb-4">
            {INVENTORY_BEHAVIOR_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer join-item">
                <input
                  type="radio"
                  name="inventory-option"
                  className="radio radio-primary"
                  value={opt.value}
                  checked={inventoryBehavior === opt.value}
                  onChange={() => setInventoryBehavior(opt.value)}
                />
                <span className="font-quicksand text-base-content">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Actions */}
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