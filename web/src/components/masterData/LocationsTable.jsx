import React from 'react';

function LocationsTable({ locations, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow bg-neutral-content m-4">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-warning text-warning-content">
            <th>Location Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-center py-4 text-gray-500">
                No locations found.
              </td>
            </tr>
          ) : (
            locations.map((location) => (
              <tr key={location.id}>
                <td>{location.name}</td>
                <td className="flex justify-end space-x-2">
                  <button
                    className="btn btn-xs btn-primary"
                    data-testid={`edit-location-${location.id}`}
                    onClick={() => onEdit(location)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-error"
                    data-testid={`delete-location-${location.id}`}
                    onClick={() => onDelete(location)}
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

export default LocationsTable;