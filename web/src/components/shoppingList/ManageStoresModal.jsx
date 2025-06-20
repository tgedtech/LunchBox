import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from '../../utils/axiosInstance';

import FavoriteIcon from '../../assets/icons/favorite.svg';
import NotFavoriteIcon from '../../assets/icons/notFavorite.svg';
import TrashIcon from '../../assets/icons/trash.svg';

/**
 * Checks if a store name exists (case-insensitive, optionally excluding an id)
 */
function nameExists(name, stores, excludeId = null) {
  return stores.some(
    s =>
      s.id !== excludeId &&
      s.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
}

/**
 * Modal for managing store entries: add, rename, favorite, delete.
 */
function ManageStoresModal({ isOpen, stores: initialStores, onClose, refresh }) {
  const [stores, setStores] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStores(initialStores.map(s => ({ ...s })));
      setAdding(false);
      setNewStoreName('');
      setEditingId(null);
      setEditingValue('');
      setChanged(false);
      setError('');
    }
  }, [isOpen, initialStores]);

  // Focus on the input when adding or editing
  useEffect(() => {
    if ((adding || editingId) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [adding, editingId]);

  if (!isOpen) return null;

  // Make a store the favorite (only one at a time)
  const handleFavorite = (id) => {
    setStores(stores =>
      stores.map(store => ({
        ...store,
        favorite: store.id === id,
      }))
    );
    setChanged(true);
  };

  // Start editing a store name
  const handleEdit = (id, value) => {
    setEditingId(id);
    setEditingValue(value);
    setError('');
  };

  // Change value while editing
  const handleEditChange = (e) => {
    setEditingValue(e.target.value);
    setError('');
  };

  // Commit edit
  const handleEditSave = (id) => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      setError('Store name cannot be empty.');
      return;
    }
    if (nameExists(trimmed, stores, id)) {
      setError('Duplicate store name.');
      return;
    }
    setStores(stores =>
      stores.map(store =>
        store.id === id ? { ...store, name: trimmed } : store
      )
    );
    setEditingId(null);
    setEditingValue('');
    setChanged(true);
    setError('');
  };

  // Show input for adding a new store
  const handleStartAdd = () => {
    setAdding(true);
    setError('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Add a new store to local state
  const handleAdd = () => {
    const name = newStoreName.trim();
    if (!name) return;
    if (nameExists(name, stores)) {
      setError('Duplicate store name.');
      return;
    }
    setStores([
      ...stores,
      {
        id: `new-${Math.random().toString(36).slice(2)}`,
        name,
        favorite: false,
        inUse: false,
        isNew: true,
      },
    ]);
    setNewStoreName('');
    setAdding(false);
    setChanged(true);
    setError('');
  };

  // Remove a store (only if not in use)
  const handleDelete = (id) => {
    setStores(stores => stores.filter(store => store.id !== id));
    setChanged(true);
    setError('');
  };

  // Batch-save all changes: create, update, delete
  const handleSave = async () => {
    setError('');
    // Add/update stores
    for (let store of stores) {
      const orig = initialStores.find(s => s.id === store.id);
      if (store.isNew) {
        try {
          await axios.post('/stores', { name: store.name, favorite: store.favorite });
        } catch (err) {
          setError('Failed to create one or more stores.');
        }
      } else if (!orig || orig.name !== store.name || orig.favorite !== store.favorite) {
        try {
          await axios.put(`/stores/${store.id}`, { name: store.name, favorite: store.favorite });
        } catch (err) {
          setError('Failed to update one or more stores.');
        }
      }
    }
    // Remove deleted stores
    for (let orig of initialStores) {
      if (!stores.find(s => s.id === orig.id)) {
        try {
          await axios.delete(`/stores/${orig.id}`);
        } catch (err) {
          setError('Failed to delete one or more stores.');
        }
      }
    }
    setChanged(false);
    refresh?.();
    onClose();
  };

  // Render a single store row: favorite, name (editable), delete (if not in use)
  const renderStoreRow = (store) => {
    const isEditing = editingId === store.id;
    const canDelete = !store.inUse;
    return (
      <div className="flex items-center gap-2 mb-1" key={store.id}>
        {/* Favorite icon */}
        <img
          src={store.favorite ? FavoriteIcon : NotFavoriteIcon}
          alt={store.favorite ? 'Favorite' : 'Not Favorite'}
          className="w-5 h-5 p-0.5 cursor-pointer"
          onClick={() => handleFavorite(store.id)}
          tabIndex={0}
          aria-label={store.favorite ? "Unmark as favorite" : "Mark as favorite"}
        />
        {/* Editable name */}
        {isEditing ? (
          <input
            type="text"
            value={editingValue}
            ref={inputRef}
            className="input input-sm w-40 bg-neutral-content font-nunito-sans text-base-content font-bold"
            onChange={handleEditChange}
            onBlur={() => handleEditSave(store.id)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleEditSave(store.id);
              if (e.key === 'Escape') {
                setEditingId(null);
                setEditingValue('');
                setError('');
              }
            }}
            maxLength={32}
          />
        ) : (
          <input
            type="text"
            value={store.name}
            readOnly
            className="input input-sm w-40 bg-neutral-content font-nunito-sans text-base-content font-bold cursor-pointer"
            tabIndex={0}
            onFocus={() => handleEdit(store.id, store.name)}
          />
        )}
        {/* Trash/delete */}
        <img
          src={TrashIcon}
          alt="Remove Store"
          className={`w-5 h-5 p-0.5 ${canDelete ? 'cursor-pointer' : 'opacity-50 pointer-events-none'}`}
          onClick={() => canDelete && handleDelete(store.id)}
          aria-disabled={!canDelete}
          tabIndex={canDelete ? 0 : -1}
        />
      </div>
    );
  };

  return (
    <div className="modal modal-open z-50" aria-modal="true" tabIndex={0}>
      <div className="modal-box bg-primary-content border-primary rounded-box border-2 p-4 min-w-[340px] max-w-xs">
        <h1 className="font-quicksand font-black text-xl text-base-content mb-2">
          Manage Stores
        </h1>
        {/* Add new store: show input if in 'adding' state */}
        <div className="mb-2">
          {!adding ? (
            <button
              className="btn btn-primary btn-xs font-quicksand font-bold"
              onClick={handleStartAdd}
            >
              Add Store
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input input-sm w-40 bg-neutral-content font-nunito-sans text-base-content font-bold"
                placeholder="New Store Name"
                value={newStoreName}
                onChange={e => {
                  setNewStoreName(e.target.value);
                  setError('');
                }}
                ref={inputRef}
                maxLength={32}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newStoreName.trim()) handleAdd();
                  if (e.key === 'Escape') {
                    setNewStoreName('');
                    setAdding(false);
                    setError('');
                  }
                }}
                onBlur={() => {
                  if (!newStoreName.trim()) {
                    setAdding(false);
                    setError('');
                  }
                }}
              />
              <button
                className="btn btn-primary btn-sm"
                disabled={
                  !newStoreName.trim() ||
                  nameExists(newStoreName, stores)
                }
                onClick={handleAdd}
                style={{ minWidth: 56 }}
              >
                Save
              </button>
            </div>
          )}
        </div>
        {/* Store list */}
        <div className="flex flex-col gap-1 mb-4">
          {stores.map(renderStoreRow)}
        </div>
        {error && (
          <div className="alert alert-error py-1 px-2 text-xs mb-2">{error}</div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn btn-outline btn-error" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!changed}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

ManageStoresModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  stores: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func,
};

export default ManageStoresModal;