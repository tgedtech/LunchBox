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

  // --- Fetch all locations from API ---
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

  // --- On mount, fetch locations ---
  useEffect(() => {
    fetchLocations();
  }, []);

  // --- Handlers for modal open/close/success ---
  const handleAddClick = () => setShowAddModal(true);
  const handleModalClose = () => setShowAddModal(false);
  const handleModalSuccess = () => {
    fetchLocations();
    setShowAddModal(false);
  };

  // --- Edit/delete handlers (stubbed for now) ---
  const handleEdit = (location) => {
    console.log('Edit location:', location);
  };
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
    <div className="p-4 pb-24">
      {/* Page header with Add button */}
      <MasterDataHeader title="Manage Locations" onAdd={handleAddClick} />

      {/* Loading, error, or table */}
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

      {/* Add Modal with fast validation */}
      <AddMasterDataModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        type="Location"
        existingItems={locations}
      />
    </div>
  );
}

export default ManageLocations;