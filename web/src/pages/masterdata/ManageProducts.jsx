import React, { useEffect, useState } from 'react';
import ProductsTable from '../../components/masterdata/ProductsTable';
import axios from '../../utils/axiosInstance';
import useAuth from '../../hooks/useAuth';
import MasterDataHeader from '../../components/MasterDataHeader';

function ManageProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Map category name (your table expects category string)
      const mappedProducts = res.data.map((product) => ({
        ...product,
        category: product.category ? product.category.name : 'None',
        location: '-', // Your table expects this, but product model does not have default location yet
        unit: product.defaultUnit || '-',
      }));
      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    console.log('Edit product:', product);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Manage Products" />
      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="text-error">{error}</p>
      ) : (
        <ProductsTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default ManageProducts;