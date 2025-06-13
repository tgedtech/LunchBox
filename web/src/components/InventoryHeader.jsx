import React from 'react';

function InventoryHeader({ onAdd, itemCount }) {
  return (
    <div className="mb-6 px-2 pb-2 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-quicksand font-bold text-primary mb-1">Inventory</h1>
          <p className="text-sm text-neutral-content">{itemCount} items across categories</p>
        </div>
      </div>
    </div>
  );
}

export default InventoryHeader;