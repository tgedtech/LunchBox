import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import StoresTable from '../../components/masterdata/StoresTable';
import MasterDataHeader from '../../components/MasterDataHeader';
import useAuth from '../../hooks/useAuth';

function ManageStores() {
  const { token } = useAuth();
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get('/stores', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStores(res.data);
      } catch (err) {
        console.error('Error fetching stores:', err);
      }
    };

    fetchStores();
  }, [token]);

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