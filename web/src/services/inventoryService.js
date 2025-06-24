import axios from '../utils/axiosInstance';

export const getInventory = () => axios.get('/inventory');
export const createInventoryItem = (data) => axios.post('/inventory', data);
export const updateInventoryItem = (id, data) => axios.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => axios.delete(`/inventory/${id}`);

// Added: getExpiredItems - returns just the expired items array
export const getExpiredItems = async () => {
  const res = await axios.get('/inventory');
  const now = new Date();
  return res.data.filter(item => item.expiration && new Date(item.expiration) < now);
};