// src/components/InventoryHeader.jsx
import React from 'react';

function InventoryHeader({ onAdd, itemCount, filteredCount }) {
  const isFiltered = itemCount !== filteredCount;

  return (
    <div className="mb-6 px-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-3xl font-quicksand font-bold text-primary mb-1 flex items-center space-x-2">
            <span>Inventory</span>
            <span className="text-base font-normal text-base-content">
              ({filteredCount} {filteredCount === 1 ? 'item' : 'items'}
              {isFiltered && ` of ${itemCount}`})
            </span>
          </h1>
        </div>

        {onAdd && (
          <button
            className="btn btn-primary btn-sm"
            onClick={onAdd}
          >
            + Add Item
          </button>
        )}
      </div>
    </div>
  );
}

export default InventoryHeader;