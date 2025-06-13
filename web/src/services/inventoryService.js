// src/services/inventoryService.js
import axios from '../utils/axiosInstance';

export const getInventory = () => axios.get('/inventory');
export const createInventoryItem = (data) => axios.post('/inventory', data);
export const updateInventoryItem = (id, data) => axios.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => axios.delete(`/inventory/${id}`);