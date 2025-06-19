import axios from '../utils/axiosInstance';

const masterDataService = {
  async getCategories() {
    const res = await axios.get('/categories');
    return res.data;
  },
  async getStores() {
    const res = await axios.get('/stores');
    return res.data;
  },
  async getProducts() {
    const res = await axios.get('/products');
    return res.data;
  },
};

export default masterDataService;