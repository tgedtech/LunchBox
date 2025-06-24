import React from 'react';

function CategoriesTable({ categories, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow bg-neutral-content m-4">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-warning text-warning-content">
            <th>Category Name</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="2" className="text-center py-4 text-gray-500">
                No categories found.
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td className="flex justify-end space-x-2">
                  <button
                    className="btn btn-xs btn-primary"
                    onClick={() => onEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => onDelete(category)}
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

export default CategoriesTable;