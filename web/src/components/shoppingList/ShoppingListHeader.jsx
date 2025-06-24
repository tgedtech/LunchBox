import React from 'react';
import PropTypes from 'prop-types';

function ShoppingListHeader({ onAdd, onManageStores, onManageCategories }) {
  return (
    <header
      className="bg-secondary min-h-15">
      <div className="flex justify-between">
        <h1 className="text-xl font-quicksand text-secondary-content font-bold p-4">
          Shopping List
        </h1>
        <div className="flex gap-1 pr-1 m-3">
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