import axios from 'axios';
import Cookies from 'js-cookie';
import { useAppStore } from '../store/app';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

let activeRequests = 0;

const startRequest = () => {
  activeRequests++;
  useAppStore.getState().setIsLoading(true);
};

const stopRequest = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    useAppStore.getState().setIsLoading(false);
  }
};

api.interceptors.request.use((config) => {
  startRequest();
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  stopRequest();
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    stopRequest();
    return response;
  },
  (error) => {
    stopRequest();
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('merchant');
        // Only redirect if we are not already on the login page!
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
