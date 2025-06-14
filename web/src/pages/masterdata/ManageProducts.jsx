// src/pages/ManageProducts.jsx
import React, { useState, useEffect } from 'react';
import MasterDataHeader from '../../components/MasterDataHeader';
import ProductsTable from '../../components/masterdata/ProductsTable';
import AddMasterDataModal from '../../components/masterdata/AddMasterDataModal';
import axios from '../../utils/axiosInstance';

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [categoriesRes, locationsRes, unitsRes] = await Promise.all([
        axios.get('/categories'),
        axios.get('/locations'),
        axios.get('/units'),
      ]);

      setCategories(categoriesRes.data);
      setLocations(locationsRes.data);
      setUnits(unitsRes.data);
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMasterData();
  }, []);

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
  };

  const handleModalSuccess = () => {
    fetchProducts();
    fetchMasterData(); // So dropdowns stay fresh!
    setShowAddModal(false);
  };

  const handleEdit = (product) => {
    console.log('Edit product:', product);
  };

  const handleDelete = (id) => {
    console.log('Delete product with id:', id);
  };

  return (
    <div className="p-4 pb-24">
      <MasterDataHeader title="Manage Products" onAdd={handleAddClick} />

      <ProductsTable products={products} onEdit={handleEdit} onDelete={handleDelete} />

      <AddMasterDataModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        type="Product"
        categories={categories}
        locations={locations}
        units={units}
      />
    </div>
  );
}

export default ManageProducts;