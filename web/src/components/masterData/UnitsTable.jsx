import React from 'react';

function UnitsTable({ units, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow bg-base-100">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Unit Name</th>
            <th>Actions</th>
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
                <td className="flex space-x-2">
                  <button
                    className="btn btn-xs btn-primary"
                    onClick={() => onEdit(unit)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => onDelete(unit.id)}
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