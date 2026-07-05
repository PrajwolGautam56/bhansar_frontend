import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bhansar_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry && !original?.url?.includes('/auth/login')) {
      original._retry = true;
      const { data } = await api.post('/auth/refresh');
      localStorage.setItem('bhansar_token', data.token);
      original.headers.Authorization = `Bearer ${data.token}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);

export default api;
