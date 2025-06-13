import React, { useState } from 'react';
import LocationsTable from '../../components/masterdata/LocationsTable';
import MasterDataHeader from '../../components/MasterDataHeader';

function ManageLocations() {
  const [locations, setLocations] = useState([
    { id: 1, name: 'Pantry' },
    { id: 2, name: 'Fridge' },
    { id: 3, name: 'Freezer' },
  ]);

  const handleAdd = () => {
    console.log('Add new location');
  };

  const handleEdit = (location) => {
    console.log('Edit location:', location);
  };

  const handleDelete = (id) => {
    console.log('Delete location with id:', id);
  };

  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Manage Locations" onAdd={handleAdd} />

      <LocationsTable
        locations={locations}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ManageLocations;