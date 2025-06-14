import React from 'react';

/**
 * ProductsTable
 * Displays all products, including category, default location, and default unit.
 * Relies on correct relation field names as returned from the backend:
 *   - product.category?.name
 *   - product.defaultLocation?.name
 *   - product.defaultUnitType?.name
 */
function ProductsTable({ products, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow bg-base-100">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Default Location</th>
            <th>Default Unit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category?.name || '-'}</td>
                <td>{product.defaultLocation?.name || '-'}</td>
                <td>{product.defaultUnitType?.name || '-'}</td>
                <td className="flex space-x-2">
                  <button
                    className="btn btn-xs btn-primary"
                    onClick={() => onEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => onDelete(product.id)}
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

export default ProductsTable;