import axios from '../utils/axiosInstance';

const shoppingListService = {
  async getItems() {
    const res = await axios.get('/shopping-list');
    return res.data;
  },

  async addItem(item) {
    const res = await axios.post('/shopping-list', item);
    return res.data;
  },

  async updateItem(id, data) {
    const res = await axios.put(`/shopping-list/${id}`, data);
    return res.data;
  },

  async deleteItem(id) {
    const res = await axios.delete(`/shopping-list/${id}`);
    return res.data;
  },

  async bulkDelete(ids) {
    const res = await axios.post('/shopping-list/bulk-delete', { ids });
    return res.data;
  }
};

export default shoppingListService;