import React, { useState } from 'react';
import CategoriesTable from '../../components/masterdata/CategoriesTable';
import MasterDataHeader from '../../components/MasterDataHeader';

function ManageCategories() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Canned Goods' },
    { id: 2, name: 'Produce' },
    { id: 3, name: 'Frozen' },
  ]);

  const handleAdd = () => {
    console.log('Add new category');
  };

  const handleEdit = (category) => {
    console.log('Edit category:', category);
  };

  const handleDelete = (id) => {
    console.log('Delete category with id:', id);
  };

  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Manage Categories" onAdd={handleAdd} />

      <CategoriesTable
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ManageCategories;