import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import CreatableSelect from 'react-select/creatable';

function AddMasterDataModal({ isOpen, onClose, onSuccess, type, categories = [], locations = [], units = [] }) {
    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setSelectedCategory(null);
            setSelectedLocation(null);
            setSelectedUnit(null);
            setError('');
        }
    }, [isOpen]);

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

    const handleSave = async () => {
        setError('');

        if (!name.trim()) {
            setError(`${type} name is required`);
            return;
        }

        try {
            const payload = { name: name.trim() };

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
            setError(`Failed to add ${type}`);
        }
    };

    const selectStyle = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: '#f9fafb', // Tailwind gray-50 (light but visible)
            borderColor: state.isFocused ? '#60a5fa' : '#d1d5db', // blue-400 on focus
            boxShadow: 'none',
            borderRadius: '0.5rem',
            minHeight: '2.5rem',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            '&:hover': {
                borderColor: '#60a5fa', // hover blue-400
            },
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
            backgroundColor: '#ffffff', // white dropdown background
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            marginTop: '4px',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#f3f4f6' : '#ffffff', // light gray on focus
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
            <input type="checkbox" id="add-masterdata-modal" className="modal-toggle" checked={isOpen} readOnly />
            <div className="modal">
                <div className="modal-box rounded-2xl border border-base-300 bg-primary-content shadow-xl">
                    <h2 className="text-xl font-quicksand font-bold text-primary mb-4">Add {type}</h2>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm mb-1 font-quicksand font-bold text-primary">{type} Name</label>
                        <input
                            type="text"
                            className="input input-bordered bg-neutral-content w-full font-nunito-sans"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`Enter ${type.toLowerCase()} name`}
                        />
                    </div>

                    {type === 'Product' && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-1 font-quicksand">Category</label>
                                <CreatableSelect
                                    styles={selectStyle}
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                                    placeholder="Enter or select category"
                                    isClearable
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-1 font-quicksand">Default Location</label>
                                <CreatableSelect
                                    styles={selectStyle}
                                    value={selectedLocation}
                                    onChange={setSelectedLocation}
                                    options={locations.map((l) => ({ value: l.id, label: l.name }))}
                                    placeholder="Enter or select location"
                                    isClearable
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-1 font-quicksand">Default Unit</label>
                                <CreatableSelect
                                    styles={selectStyle}
                                    value={selectedUnit}
                                    onChange={setSelectedUnit}
                                    options={units.map((u) => ({ value: u.id, label: u.name }))}
                                    placeholder="Enter or select unit"
                                    isClearable
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-2 mt-6 font-nunito-sans">
                        <button className="btn btn-outline btn-error" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            Save {type}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddMasterDataModal;