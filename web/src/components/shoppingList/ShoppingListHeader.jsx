import React from 'react';
import PropTypes from 'prop-types';

function ShoppingListHeader({ onAdd, onManageStores, onManageCategories }) {
  return (
    <header
      className="w-full bg-secondary text-secondary-content shadow-lg flex items-center justify-between px-8"
      style={{ minHeight: '88px' }}
    >
      <h1 className="text-3xl font-quicksand font-bold">
        Shopping List
      </h1>
      <div className="flex gap-2">
        <button className="btn btn-primary btn-sm" onClick={onAdd}>
          + Add Items
        </button>
        <button className="btn btn-soft btn-primary btn-sm" onClick={onManageStores}>
          Stores
        </button>
        <button className="btn btn-soft btn-primary btn-sm" onClick={onManageCategories}>
          Categories
        </button>
      </div>
    </header>
  );
}

ShoppingListHeader.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onManageStores: PropTypes.func,
  onManageCategories: PropTypes.func,
};

export default ShoppingListHeader;