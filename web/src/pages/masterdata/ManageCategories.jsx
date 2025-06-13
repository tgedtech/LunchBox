import React, { useEffect, useState } from 'react';
import CategoriesTable from '../../components/masterdata/CategoriesTable';
import axios from '../../utils/axiosInstance';
import useAuth from '../../hooks/useAuth';
import MasterDataHeader from '../../components/MasterDataHeader';

function ManageCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    console.log('Edit category:', category);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Manage Categories" />
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
    </div>
  );
}

export default ManageCategories;