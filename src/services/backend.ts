import axios from 'axios';
import { userManager } from './auth';

const backend = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
  headers: {
    accept: 'application/json'
  }
});

backend.interceptors.request.use(async (config) => {
  const user = await userManager.getUser();
  if (user && !user.expired) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});

export default backend;
