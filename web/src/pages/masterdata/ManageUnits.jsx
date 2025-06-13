import React, { useState } from 'react';
import UnitsTable from '../../components/masterdata/UnitsTable';
import MasterDataHeader from '../../components/MasterDataHeader';

function ManageUnits() {
  const [units, setUnits] = useState([
    { id: 1, name: 'piece' },
    { id: 2, name: 'kg' },
    { id: 3, name: 'liter' },
  ]);

  const handleAdd = () => {
    console.log('Add new unit');
  };

  const handleEdit = (unit) => {
    console.log('Edit unit:', unit);
  };

  const handleDelete = (id) => {
    console.log('Delete unit with id:', id);
  };

  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Manage Units" onAdd={handleAdd} />

      <UnitsTable
        units={units}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ManageUnits;