import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gestion-scolaire-api.vercel.app/',
  // baseURL: 'http://127.0.0.1:8000', // L'URL de ton backend FastAPI
});

// Ajoute automatiquement le token si tu as géré l'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;