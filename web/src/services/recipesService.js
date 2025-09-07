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
  async validateTitle(title, excludeId) {
    const { data } = await api.get('/recipes/_validate/title', { params: { title, excludeId } });
    return data; // { exists: boolean }
  },
  // NEW — used by IngredientRow when user creates a new product inline
  async createProduct(body) {
    const { data } = await api.post('/products', body || {});
    return data;
  },
  // Units helpers (look up list, or create if user typed a new unit)
  async listUnits() {
    const { data } = await api.get('/units');
    return data;
  },
  async createUnit(name) {
    const { data } = await api.post('/units', { name });
    return data;
  },
};