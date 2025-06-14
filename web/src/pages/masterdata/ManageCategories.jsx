import React, { useEffect, useState } from 'react';
import CategoriesTable from '../../components/masterdata/CategoriesTable';
import axios from '../../utils/axiosInstance';
import useAuth from '../../hooks/useAuth';
import MasterDataHeader from '../../components/MasterDataHeader';
import AddMasterDataModal from '../../components/masterdata/AddMasterDataModal';

function ManageCategories() {
  // --- Auth for protected endpoints ---
  const { token } = useAuth();

  // --- Category state and fetch status ---
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Modal open/close state ---
  const [showAddModal, setShowAddModal] = useState(false);

  // --- Fetch all categories from API ---
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // --- On mount, fetch categories ---
  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Edit (stub for now) ---
  const handleEdit = (category) => {
    console.log('Edit category:', category);
    // TODO: Implement edit
  };

  // --- Delete handler with confirmation and refresh ---
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        // TODO: Show error toast/UI
      }
    }
  };

  // --- Add modal open/close handlers ---
  const handleAddClick = () => setShowAddModal(true);
  const handleModalClose = () => setShowAddModal(false);
  const handleModalSuccess = () => {
    fetchCategories();
    setShowAddModal(false);
  };

  // --- Render ---
  return (
    <div className="p-4 pb-24">
      {/* Page header with Add button */}
      <MasterDataHeader title="Manage Categories" onAdd={handleAddClick} />

      {/* Loading, error, or table */}
      {loading ? (
        <p>Loading categories...</p>
      ) : error ? (
        <p className="text-error">{error}</p>
      ) : (
        <CategoriesTable
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal for adding a new category */}
      <AddMasterDataModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        type="Category"
        existingItems={categories}
      />
    </div>
  );
}

export default ManageCategories;