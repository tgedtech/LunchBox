import React from 'react';

function StoresTable({ stores, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow bg-neutral-content m-4">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-warning text-warning-content">
            <th>Store Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stores.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-center py-4 text-gray-500">
                No stores found.
              </td>
            </tr>
          ) : (
            stores.map((store) => (
              <tr key={store.id}>
                <td>{store.name}</td>
                <td className="flex justify-end space-x-2">
                  <button
                    className="btn btn-xs btn-primary"
                    data-testid={`edit-store-${store.id}`}
                    onClick={() => onEdit(store)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-error"
                    data-testid={`delete-store-${store.id}`}
                    onClick={() => onDelete(store)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StoresTable;