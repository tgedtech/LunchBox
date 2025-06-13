import React, { useState } from 'react';
import ProductsTable from '../../components/masterdata/ProductsTable';
import MasterDataHeader from '../../components/MasterDataHeader';

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

  const handleAdd = () => {
    console.log('Add new product');
  };

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
            <MasterDataHeader title="Manage Products" onAdd={handleAdd} />

      <ProductsTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ManageProducts;