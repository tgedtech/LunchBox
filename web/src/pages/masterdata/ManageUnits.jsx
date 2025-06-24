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

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUnit, setEditUnit] = useState(null);

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

  const handleAddClick = () => setShowAddModal(true);
  const handleModalClose = () => setShowAddModal(false);
  const handleModalSuccess = () => {
    fetchUnits();
    setShowAddModal(false);
  };

  // Edit handlers
  const handleEdit = (unit) => {
    setEditUnit(unit);
    setShowEditModal(true);
  };
  const handleEditModalClose = () => {
    setEditUnit(null);
    setShowEditModal(false);
  };
  const handleEditModalSuccess = () => {
    fetchUnits();
    setEditUnit(null);
    setShowEditModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await axios.delete(`/units/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUnits();
      } catch (err) {
        console.error('Error deleting unit:', err);
      }
    }
  };

  return (
    <div className="w-full pb-24">
      {/* Header for the page */}
      <div className="bg-warning min-h-15">
        <div className="flex justify-between">
          <h1 className="font-nunito-sans font-black text-xl text-warning-content p-4">Manage Units</h1>
          <div className="flex justify-end gap-1 pr-1">
            <button
              className="btn btn-primary btn-md font-nunito-sans font-bold rounded-lg m-2"
              onClick={handleAddClick}
            >
              + Add
            </button>
          </div>
        </div>
      </div> 
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

      {/* Edit Modal */}
      <AddMasterDataModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        onSuccess={handleEditModalSuccess}
        type="Unit"
        existingItems={units}
        isEdit={true}
        initialItem={editUnit}
      />
    </div>
  );
}

export default ManageUnits;