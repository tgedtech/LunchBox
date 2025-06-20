import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from '../../utils/axiosInstance';

// SVGs
import FavoriteIcon from '../../assets/icons/favorite.svg';
import NotFavoriteIcon from '../../assets/icons/notFavorite.svg';
import TrashIcon from '../../assets/icons/trash.svg';

/**
 * Returns true if a name exists in the category list (case-insensitive), excluding a specific id if provided.
 */
function nameExists(name, categories, excludeId = null) {
  return categories.some(
    c =>
      c.id !== excludeId &&
      c.name.trim().toLowerCase() === name.trim().toLowerCase()
  );
}

/**
 * Category management modal for adding, renaming, favoriting, and deleting product categories.
 */
function ManageCategoriesModal({ isOpen, categories: initialCategories, onClose, refresh }) {
  const [categories, setCategories] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setCategories(initialCategories.map(c => ({ ...c })));
      setAdding(false);
      setNewCategoryName('');
      setEditingId(null);
      setEditingValue('');
      setChanged(false);
      setError('');
    }
  }, [isOpen, initialCategories]);

  // Focus on input when adding new category or editing
  useEffect(() => {
    if ((adding || editingId) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [adding, editingId]);

  if (!isOpen) return null;

  // Set single favorite, only one allowed
  const handleFavorite = (id) => {
    setCategories(categories =>
      categories.map(cat => ({
        ...cat,
        favorite: cat.id === id,
      }))
    );
    setChanged(true);
  };

  // Start editing an existing category
  const handleEdit = (id, value) => {
    setEditingId(id);
    setEditingValue(value);
    setError('');
  };

  // Handle edit field change
  const handleEditChange = (e) => {
    setEditingValue(e.target.value);
    setError('');
  };

  // Commit edit (save new name)
  const handleEditSave = (id) => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      setError('Category name cannot be empty.');
      return;
    }
    if (nameExists(trimmed, categories, id)) {
      setError('Duplicate category name.');
      return;
    }
    setCategories(categories =>
      categories.map(cat =>
        cat.id === id ? { ...cat, name: trimmed } : cat
      )
    );
    setEditingId(null);
    setEditingValue('');
    setChanged(true);
    setError('');
  };

  // Start the add flow (show input)
  const handleStartAdd = () => {
    setAdding(true);
    setError('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Add new category to local state
  const handleAdd = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (nameExists(name, categories)) {
      setError('Duplicate category name.');
      return;
    }
    setCategories([
      ...categories,
      {
        id: `new-${Math.random().toString(36).slice(2)}`,
        name,
        favorite: false,
        inUse: false,
        isNew: true,
      },
    ]);
    setNewCategoryName('');
    setAdding(false);
    setChanged(true);
    setError('');
  };

  // Remove category (only if not in use)
  const handleDelete = (id) => {
    setCategories(categories => categories.filter(cat => cat.id !== id));
    setChanged(true);
    setError('');
  };

  // Save all changes in batch: add, update, delete
  const handleSave = async () => {
    setError('');
    // Add/update categories
    for (let cat of categories) {
      const orig = initialCategories.find(c => c.id === cat.id);
      if (cat.isNew) {
        try {
          await axios.post('/categories', { name: cat.name, favorite: cat.favorite });
        } catch (err) {
          setError('Failed to create one or more categories.');
        }
      } else if (!orig || orig.name !== cat.name || orig.favorite !== cat.favorite) {
        try {
          await axios.put(`/categories/${cat.id}`, { name: cat.name, favorite: cat.favorite });
        } catch (err) {
          setError('Failed to update one or more categories.');
        }
      }
    }
    // Remove deleted categories
    for (let orig of initialCategories) {
      if (!categories.find(c => c.id === orig.id)) {
        try {
          await axios.delete(`/categories/${orig.id}`);
        } catch (err) {
          setError('Failed to delete one or more categories.');
        }
      }
    }
    setChanged(false);
    refresh?.();
    onClose();
  };

  // Renders a single editable row for each category (favorite, name, delete)
  const renderCategoryRow = (cat) => {
    const isEditing = editingId === cat.id;
    const canDelete = !cat.inUse;
    return (
      <div className="flex items-center gap-2 mb-1" key={cat.id}>
        {/* Favorite (star) */}
        <img
          src={cat.favorite ? FavoriteIcon : NotFavoriteIcon}
          alt={cat.favorite ? 'Favorite' : 'Not Favorite'}
          className="w-5 h-5 p-0.5 cursor-pointer"
          onClick={() => handleFavorite(cat.id)}
          tabIndex={0}
          aria-label={cat.favorite ? "Unmark as favorite" : "Mark as favorite"}
        />
        {/* Editable name */}
        {isEditing ? (
          <input
            type="text"
            value={editingValue}
            ref={inputRef}
            className="input input-sm w-40 bg-neutral-content font-nunito-sans text-base-content font-bold"
            onChange={handleEditChange}
            onBlur={() => handleEditSave(cat.id)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleEditSave(cat.id);
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
            value={cat.name}
            readOnly
            className="input input-sm w-40 bg-neutral-content font-nunito-sans text-base-content font-bold cursor-pointer"
            tabIndex={0}
            onFocus={() => handleEdit(cat.id, cat.name)}
          />
        )}
        {/* Trash (delete) */}
        <img
          src={TrashIcon}
          alt="Remove Category"
          className={`w-5 h-5 p-0.5 ${canDelete ? 'cursor-pointer' : 'opacity-50 pointer-events-none'}`}
          onClick={() => canDelete && handleDelete(cat.id)}
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
          Manage Categories
        </h1>
        {/* Add new: only show input if in 'adding' state */}
        <div className="mb-2">
          {!adding ? (
            <button
              className="btn btn-primary btn-xs font-quicksand font-bold"
              onClick={handleStartAdd}
            >
              Add Category
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input input-sm w-40 bg-neutral-content font-nunito-sans text-base-content font-bold"
                placeholder="New Category Name"
                value={newCategoryName}
                onChange={e => {
                  setNewCategoryName(e.target.value);
                  setError('');
                }}
                ref={inputRef}
                maxLength={32}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCategoryName.trim()) handleAdd();
                  if (e.key === 'Escape') {
                    setNewCategoryName('');
                    setAdding(false);
                    setError('');
                  }
                }}
                onBlur={() => {
                  if (!newCategoryName.trim()) {
                    setAdding(false);
                    setError('');
                  }
                }}
              />
              <button
                className="btn btn-primary btn-sm"
                disabled={
                  !newCategoryName.trim() ||
                  nameExists(newCategoryName, categories)
                }
                onClick={handleAdd}
                style={{ minWidth: 56 }}
              >
                Save
              </button>
            </div>
          )}
        </div>
        {/* Category list */}
        <div className="flex flex-col gap-1 mb-4">
          {categories.map(renderCategoryRow)}
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

ManageCategoriesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  categories: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func,
};

export default ManageCategoriesModal;