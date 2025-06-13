import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import UnitsTable from '../../components/masterdata/UnitsTable';
import MasterDataHeader from '../../components/MasterDataHeader';
import useAuth from '../../hooks/useAuth';

function ManageUnits() {
  const { token } = useAuth();
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.get('/units', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUnits(res.data);
      } catch (err) {
        console.error('Error fetching units:', err);
      }
    };

    fetchUnits();
  }, [token]);

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