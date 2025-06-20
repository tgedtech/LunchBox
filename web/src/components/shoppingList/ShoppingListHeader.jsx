import React from 'react';
import PropTypes from 'prop-types';

function ShoppingListHeader({ onAdd, onManageStores, onManageCategories }) {
  return (
    <div className="mb-6 flex justify-between items-center px-2">
      <h1 className="text-3xl font-quicksand font-bold text-primary">
        Shopping List
      </h1>
      <div className="flex gap-2">
        <button className="btn btn-primary btn-sm" onClick={onAdd}>
          + Add Items
        </button>
        <button className="btn btn-outline btn-primary btn-sm" onClick={onManageStores}>
          Stores
        </button>
        <button className="btn btn-outline btn-primary btn-sm" onClick={onManageCategories}>
          Categories
        </button>
      </div>
    </div>
  );
}

ShoppingListHeader.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onManageStores: PropTypes.func,
  onManageCategories: PropTypes.func,
};

export default ShoppingListHeader;