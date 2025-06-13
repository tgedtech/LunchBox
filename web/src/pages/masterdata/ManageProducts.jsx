import React, { useState } from 'react';
import ProductsTable from '../../components/masterdata/ProductsTable';

function ManageProducts() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Black Beans',
      category: 'Canned Goods',
      location: 'Pantry',
      unit: 'Can',
    },
    {
      id: 2,
      name: 'Chicken Breast',
      category: 'Meat',
      location: 'Freezer',
      unit: 'Pound',
    },
    {
      id: 3,
      name: 'Apples',
      category: 'Produce',
      location: 'Fridge',
      unit: 'Each',
    },
  ]);

  const handleEdit = (product) => {
    console.log('Edit product:', product);
    // Implement modal or form later
  };

  const handleDelete = (id) => {
    console.log('Delete product with id:', id);
    setProducts(products.filter((product) => product.id !== id));
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-3xl font-quicksand font-bold text-primary mb-6">Manage Products</h1>

      <div className="flex justify-end mb-4">
        <button
          className="btn btn-primary"
          onClick={() => console.log('Add new product')}
        >
          + Add Product
        </button>
      </div>

      <ProductsTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ManageProducts;