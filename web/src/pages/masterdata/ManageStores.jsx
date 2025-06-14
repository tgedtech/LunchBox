import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import StoresTable from '../../components/masterdata/StoresTable';
import MasterDataHeader from '../../components/MasterDataHeader';
import useAuth from '../../hooks/useAuth';
import AddMasterDataModal from '../../components/masterdata/AddMasterDataModal';

function ManageStores() {
  const { token } = useAuth();
  const [stores, setStores] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- Fetch all stores from API ---
  const fetchStores = async () => {
    try {
      const res = await axios.get('/stores', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(res.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [token]);

  // --- Modal open/close/success handlers ---
  const handleAddClick = () => setShowAddModal(true);
  const handleModalClose = () => setShowAddModal(false);
  const handleModalSuccess = () => {
    fetchStores();
    setShowAddModal(false);
  };

  // --- Edit/delete handlers (stubbed for now) ---
  const handleEdit = (store) => {
    console.log('Edit store:', store);
  };
  const handleDelete = (id) => {
    console.log('Delete store with id:', id);
  };

  return (
    <div className="p-4 pb-24">
      {/* Page header with Add button */}
      <MasterDataHeader title="Manage Stores" onAdd={handleAddClick} />

      {/* Table of stores */}
      <StoresTable
        stores={stores}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add Modal */}
      <AddMasterDataModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        type="Store"
        existingItems={stores}
      />
    </div>
  );
}

export default ManageStores;