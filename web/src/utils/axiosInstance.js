import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5001', // TODO: make this dynamic for prod later
});

// Attach token if it exists
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default instance;