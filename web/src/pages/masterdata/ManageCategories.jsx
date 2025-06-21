import React, { useEffect, useState } from 'react';
import CategoriesTable from '../../components/masterdata/CategoriesTable';
import axios from '../../utils/axiosInstance';
import useAuth from '../../hooks/useAuth';
import MasterDataHeader from '../../components/MasterDataHeader';
import AddMasterDataModal from '../../components/masterdata/AddMasterDataModal';
import ConfirmReassignDeleteModal from '../../components/common/ConfirmReassignDeleteModal';

function ManageCategories() {
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  // Delete state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    category: null,
    error: '',
    loading: false,
  });

  const fetchCategories = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const handleEdit = (category) => {
    setEditCategory(category);
    setShowEditModal(true);
  };

  const handleDelete = (category) => {
    setDeleteModal({
      open: true,
      category,
      error: '',
      loading: false,
    });
  };

  const handleConfirmDelete = async (reassignToCategoryId) => {
    setDeleteModal((modal) => ({ ...modal, loading: true, error: '' }));
    try {
      await axios.post(
        `/categories/${deleteModal.category.id}/reassign-and-delete`,
        { reassignToCategoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeleteModal({ open: false, category: null, error: '', loading: false });
      fetchCategories();
    } catch (err) {
      console.error('Error during reassign/delete:', err);
      setDeleteModal((modal) => ({
        ...modal,
        error: err?.response?.data?.error || 'Failed to reassign/delete category',
        loading: false,
      }));
    }
  };

  const handleAddClick = () => setShowAddModal(true);
  const handleModalClose = () => setShowAddModal(false);
  const handleModalSuccess = () => {
    fetchCategories();
    setShowAddModal(false);
  };

  // Edit modal handlers
  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditCategory(null);
  };
  const handleEditModalSuccess = () => {
    fetchCategories();
    setShowEditModal(false);
    setEditCategory(null);
  };

  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Manage Categories" onAdd={handleAddClick} />

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
        isEdit={false}
        initialItem={null}
      />

      {/* Modal for editing a category */}
      <AddMasterDataModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        onSuccess={handleEditModalSuccess}
        type="Category"
        existingItems={categories}
        isEdit={true}
        initialItem={editCategory}
      />

      {/* Confirm delete & reassign modal */}
      <ConfirmReassignDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, category: null, error: '', loading: false })}
        onConfirm={handleConfirmDelete}
        entityType="Category"
        entityName={deleteModal.category?.name || ''}
        options={categories}
        excludeId={deleteModal.category?.id}
        loading={deleteModal.loading}
        error={deleteModal.error}
      />
    </div>
  );
}

export default ManageCategories;