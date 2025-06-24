import React, { useEffect, useState } from 'react';
import LocationsTable from '../../components/masterdata/LocationsTable';
import axios from '../../utils/axiosInstance';
import useAuth from '../../hooks/useAuth';
import MasterDataHeader from '../../components/MasterDataHeader';
import AddMasterDataModal from '../../components/masterdata/AddMasterDataModal';

function ManageLocations() {
  const { token } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // For editing
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLocation, setEditLocation] = useState(null);

  const fetchLocations = async () => {
    try {
      const res = await axios.get('/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(res.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Add handlers
  const handleAddClick = () => setShowAddModal(true);
  const handleModalClose = () => setShowAddModal(false);
  const handleModalSuccess = () => {
    fetchLocations();
    setShowAddModal(false);
  };

  // Edit handlers
  const handleEdit = (location) => {
    setEditLocation(location);
    setShowEditModal(true);
  };
  const handleEditModalClose = () => {
    setEditLocation(null);
    setShowEditModal(false);
  };
  const handleEditModalSuccess = () => {
    fetchLocations();
    setEditLocation(null);
    setShowEditModal(false);
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await axios.delete(`/locations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchLocations();
      } catch (err) {
        console.error('Error deleting location:', err);
      }
    }
  };

  return (
    <div className="w-full pb-24">
      {/* Header for the page */}
      <div className="bg-warning min-h-15">
        <div className="flex justify-between">
          <h1 className="font-nunito-sans font-black text-xl text-warning-content p-4">Manage Locations</h1>
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

      {loading ? (
        <p>Loading locations...</p>
      ) : error ? (
        <p className="text-error">{error}</p>
      ) : (
        <LocationsTable
          locations={locations}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add Modal */}
      <AddMasterDataModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        type="Location"
        existingItems={locations}
      />

      {/* Edit Modal */}
      <AddMasterDataModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        onSuccess={handleEditModalSuccess}
        type="Location"
        existingItems={locations}
        isEdit={true}
        initialItem={editLocation}
      />
    </div>
  );
}

export default ManageLocations;