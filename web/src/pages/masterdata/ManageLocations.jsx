import React, { useEffect, useState } from 'react';
import LocationsTable from '../../components/masterdata/LocationsTable';
import axios from '../../utils/axiosInstance';
import useAuth from '../../hooks/useAuth';
import MasterDataHeader from '../../components/MasterDataHeader';

function ManageLocations() {
  const { token } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <MasterDataHeader title="Manage Locations" />
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
    </div>
  );
}

export default ManageLocations;