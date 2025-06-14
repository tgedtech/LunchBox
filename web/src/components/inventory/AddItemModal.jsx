import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from '../../utils/axiosInstance';

function AddItemModal({ isOpen, onClose, onSuccess, products, categories, locations, stores, units }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [expiration, setExpiration] = useState('');
    const [error, setError] = useState('');

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
        }
    }, [isOpen]);

    const handleProductChange = (newValue) => {
        setSelectedProduct(newValue);

        // If new product, clear category
        if (newValue?.__isNew__) {
            setSelectedCategory(null);
        } else {
            const existing = products.find((p) => p.id === newValue?.value);
            if (existing) {
                setSelectedCategory(existing.category ? { value: existing.category.id, label: existing.category.name } : null);
            } else {
                setSelectedCategory(null);
            }
        }
    };

    const handleSave = async () => {
        setError('');
        if (!selectedProduct || !selectedProduct.label?.trim()) {
            setError('Product name is required');
            return;
        }

        try {
            // Create new Category if needed
            if (selectedCategory?.__isNew__) {
                const categoryRes = await axios.post('/categories', { name: selectedCategory.label });
                setSelectedCategory({ value: categoryRes.data.id, label: categoryRes.data.name });
            }

            // Create new Location if needed
            if (selectedLocation?.__isNew__) {
                const locationRes = await axios.post('/locations', { name: selectedLocation.label });
                setSelectedLocation({ value: locationRes.data.id, label: locationRes.data.name });
            }

            // Create new Store if needed
            if (selectedStore?.__isNew__) {
                const storeRes = await axios.post('/stores', { name: selectedStore.label });
                setSelectedStore({ value: storeRes.data.id, label: storeRes.data.name });
            }

            // Create new Unit if needed
            if (selectedUnit?.__isNew__) {
                const unitRes = await axios.post('/units', { name: selectedUnit.label });
                setSelectedUnit({ value: unitRes.data.id, label: unitRes.data.name });
            }

            // MAIN FIX: Guarantee productId in local variable
            let productId;
            if (selectedProduct?.__isNew__) {
                const productRes = await axios.post('/products', {
                    name: selectedProduct.label.trim(),
                    categoryId: selectedCategory?.value || null,
                });
                productId = productRes.data.id;

                // Update local state for future UX consistency
                setSelectedProduct({ value: productRes.data.id, label: productRes.data.name });
            } else {
                productId = selectedProduct?.value;
            }

            // Post inventory with guaranteed productId
            await axios.post('/inventory', {
                productId, // guaranteed to be valid here
                locationId: selectedLocation?.value,
                unit: selectedUnit?.label || '',
                quantity,
                expiration: expiration ? new Date(expiration).toISOString() : null,
                opened: false,
            });

            // Success flow
            onSuccess && onSuccess();
            onClose();
        } catch (err) {
            console.error('Error adding item:', err);
            setError('Failed to add item');
        }
    };

    const selectStyle = {
        control: (provided) => ({
            ...provided,
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            borderColor: 'var(--glass-border-light)',
            boxShadow: 'none',
            color: 'var(--glass-content)',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'rgba(255,255,255,0.95)',
        }),
    };

    return (
        <>
            <input type="checkbox" id="add-item-modal" className="modal-toggle" checked={isOpen} readOnly />
            <div className="modal">
                <div
                    className="modal-box rounded-2xl shadow-[var(--glass-shadow)] backdrop-blur-md backdrop-saturate-[var(--glass-saturate)] border"
                    style={{
                        backgroundColor: 'var(--glass-bg-light)',
                        borderColor: 'var(--glass-border-light)',
                    }}
                >
                    <h2 className="text-xl font-quicksand font-bold text-primary mb-4">Add Item</h2>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Product */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Product Name</label>
                        <CreatableSelect
                            styles={selectStyle}
                            value={selectedProduct}
                            onChange={handleProductChange}
                            options={products.map((p) => ({ value: p.id, label: p.name }))}
                            placeholder="Enter or select product"
                            isClearable
                        />
                    </div>

                    {/* Quantity */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input
                            type="number"
                            min={1}
                            className="input input-bordered w-full"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <CreatableSelect
                            styles={selectStyle}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            options={categories.map((c) => ({ value: c.id, label: c.name }))}
                            placeholder="Enter or select category"
                            isClearable
                        />
                    </div>

                    {/* Location */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <CreatableSelect
                            styles={selectStyle}
                            value={selectedLocation}
                            onChange={setSelectedLocation}
                            options={locations.map((l) => ({ value: l.id, label: l.name }))}
                            placeholder="Enter or select location"
                            isClearable
                        />
                    </div>

                    {/* Store */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Store</label>
                        <CreatableSelect
                            styles={selectStyle}
                            value={selectedStore}
                            onChange={setSelectedStore}
                            options={stores.map((s) => ({ value: s.id, label: s.name }))}
                            placeholder="Enter or select store"
                            isClearable
                        />
                    </div>

                    {/* Unit */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Unit</label>
                        <CreatableSelect
                            styles={selectStyle}
                            value={selectedUnit}
                            onChange={setSelectedUnit}
                            options={units.map((u) => ({ value: u.id, label: u.name }))}
                            placeholder="Enter or select unit"
                            isClearable
                        />
                    </div>

                    {/* Expiration */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Expiration Date (optional)</label>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={expiration}
                            onChange={(e) => setExpiration(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2">
                        <button className="btn btn-outline" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            Save Item
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddItemModal;