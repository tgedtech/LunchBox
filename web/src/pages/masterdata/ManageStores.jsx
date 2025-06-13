import React, { useState } from 'react';
import StoresTable from '../../components/masterdata/StoresTable';
import MasterDataHeader from '../../components/MasterDataHeader';

function ManageStores() {
  const [stores, setStores] = useState([
    { id: 1, name: 'Kroger' },
    { id: 2, name: 'Publix' },
    { id: 3, name: 'Costco' },
  ]);

  const handleAdd = () => {
    console.log('Add new store');
  };

  const handleEdit = (store) => {
    console.log('Edit store:', store);
  };

  const handleDelete = (id) => {
    console.log('Delete store with id:', id);
  };

  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Manage Stores" onAdd={handleAdd} />

      <StoresTable
        stores={stores}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ManageStores;