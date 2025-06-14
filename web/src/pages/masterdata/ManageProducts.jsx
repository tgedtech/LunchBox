import React, { useState, useEffect } from 'react';
import MasterDataHeader from '../../components/MasterDataHeader';
import ProductsTable from '../../components/masterdata/ProductsTable';
import AddMasterDataModal from '../../components/masterdata/AddMasterDataModal';
import axios from '../../utils/axiosInstance';

// Main page for managing all product master data
function ManageProducts() {
  // ---- State for all master data entities ----
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);

  // Modal control state
  const [showAddModal, setShowAddModal] = useState(false);

  // ---- Fetch functions for each data set ----

  // Fetch products from the API
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Fetch all master data (categories, locations, units) in parallel
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

  // ---- Initial load: fetch all master/product data ----
  useEffect(() => {
    fetchProducts();
    fetchMasterData();
  }, []);

  // ---- Modal open/close logic ----

  // Open add product modal
  const handleAddClick = () => {
    setShowAddModal(true);
  };

  // Close modal (without saving)
  const handleModalClose = () => {
    setShowAddModal(false);
  };

  // On successful add, refresh data and close modal
  const handleModalSuccess = () => {
    fetchProducts();
    fetchMasterData();
    setShowAddModal(false);
  };

  // ---- Placeholder edit/delete handlers ----
  // (Replace with real implementations as needed)
  const handleEdit = (product) => {
    console.log('Edit product:', product);
    // Implement edit logic/modal as needed
  };

  const handleDelete = (id) => {
    console.log('Delete product with id:', id);
    // Implement delete logic/confirmation as needed
  };

  // ---- Render master data UI ----
  return (
    <div className="p-4 pb-24">
      {/* Page header with "Add" button */}
      <MasterDataHeader title="Manage Products" onAdd={handleAddClick} />

      {/* Table listing all products */}
      <ProductsTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal for adding a new product */}
      <AddMasterDataModal
        isOpen={showAddModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        type="Product"
        categories={categories}
        locations={locations}
        units={units}
        existingItems={products}
      />
    </div>
  );
}

export default ManageProducts;