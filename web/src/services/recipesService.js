import api from '../utils/axiosInstance';

export const recipesService = {
  async all(params = {}) {
    const { data } = await api.get('/recipes', { params });
    return data;
  },
  async byId(id) {
    const { data } = await api.get(`/recipes/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post('/recipes', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/recipes/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/recipes/${id}`);
    return data;
  },
  async toggleFavorite(id) {
    const { data } = await api.patch(`/recipes/${id}/favorite`);
    return data;
  },
  async searchProducts(q, take = 20) {
    const { data } = await api.get('/recipes/_search/products', { params: { q, take } });
    return data;
  },
};