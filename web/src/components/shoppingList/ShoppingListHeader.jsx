import React from 'react';
import PropTypes from 'prop-types';

function ShoppingListHeader({ onAdd }) {
  return (
    <div className="mb-6 flex justify-between items-center px-2">
      <h1 className="text-3xl font-quicksand font-bold text-primary">Shopping List</h1>
      <button className="btn btn-primary btn-sm" onClick={onAdd}>
        + Add Items
      </button>
    </div>
  );
}
ShoppingListHeader.propTypes = { onAdd: PropTypes.func };
export default ShoppingListHeader;