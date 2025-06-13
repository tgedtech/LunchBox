// src/components/MasterDataHeader.jsx
import React from 'react';

function MasterDataHeader({ title, onAdd }) {
  return (
    <div className="mb-6 px-2">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-quicksand font-bold text-primary mb-1">{title}</h1>
        {onAdd && (
          <button
            className="btn btn-primary btn-sm"
            onClick={onAdd}
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );
}

export default MasterDataHeader;