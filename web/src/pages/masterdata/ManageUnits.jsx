import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance';
import UnitsTable from '../../components/masterdata/UnitsTable';
import MasterDataHeader from '../../components/MasterDataHeader';
import useAuth from '../../hooks/useAuth';
import AddMasterDataModal from '../../components/masterdata/AddMasterDataModal';

function ManageUnits() {
  const { token } = useAuth();
  const [units, setUnits] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- Fetch all units from API ---
  const fetchUnits = async () => {
    try {
      const res = await axios.get('/units', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(res.data);
    } catch (err) {
      console.error('Error fetching units:', err);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [token]);

  // --- Modal open/close/success handlers ---
  const handleAddClick = () => setShowAddModal(true);
  const handleModalClose = () => setShowAddModal(false);
  const handleModalSuccess = () => {
    fetchUnits();
    setShowAddModal(false);
  };

  // --- Edit/delete handlers (stubbed for now) ---
  const handleEdit = (unit) => {
    console.log('Edit unit:', unit);
  };
  const handleDelete = (id) => {
    console.log('Delete unit with id:', id);
  };

  return (
    <div className="p-4 pb-24">
      {/* Page header with Add button */}
      <MasterDataHeader title="Manage Units" onAdd={handleAddClick} />

      {/* Table of units */}
      <UnitsTable
        units={units}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add Modal */}
      <AddMasterDataModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        type="Unit"
        existingItems={units}
      />
    </div>
  );
}

export default ManageUnits;