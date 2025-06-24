import React from 'react';

function UnitsTable({ units, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow bg-neutral-content m-4">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-warning text-warning-content">
            <th>Unit Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-center py-4 text-gray-500">
                No units found.
              </td>
            </tr>
          ) : (
            units.map((unit) => (
              <tr key={unit.id}>
                <td>{unit.name}</td>
                <td className="flex justify-end space-x-2">
                  <button
                    className="btn btn-xs btn-primary"
                    data-testid={`edit-unit-${unit.id}`}
                    onClick={() => onEdit(unit)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-error"
                    data-testid={`delete-unit-${unit.id}`}
                    onClick={() => onDelete(unit)}
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

export default UnitsTable;