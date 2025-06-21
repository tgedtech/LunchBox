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

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStore, setEditStore] = useState(null);

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

  const handleAddClick = () => setShowAddModal(true);
  const handleModalClose = () => setShowAddModal(false);
  const handleModalSuccess = () => {
    fetchStores();
    setShowAddModal(false);
  };

  // Edit handlers
  const handleEdit = (store) => {
    setEditStore(store);
    setShowEditModal(true);
  };
  const handleEditModalClose = () => {
    setEditStore(null);
    setShowEditModal(false);
  };
  const handleEditModalSuccess = () => {
    fetchStores();
    setEditStore(null);
    setShowEditModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await axios.delete(`/stores/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchStores();
      } catch (err) {
        console.error('Error deleting store:', err);
      }
    }
  };

  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Manage Stores" onAdd={handleAddClick} />
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

      {/* Edit Modal */}
      <AddMasterDataModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        onSuccess={handleEditModalSuccess}
        type="Store"
        existingItems={stores}
        isEdit={true}
        initialItem={editStore}
      />
    </div>
  );
}

export default ManageStores;