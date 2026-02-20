import axios from 'axios';
import { API_URL } from '../constants/constants';

// Check if URL is an ngrok URL
const isNgrokUrl = (url) => url && url.includes('ngrok');

const axiosServices = axios.create({
  baseURL: `${API_URL}/api/${import.meta.env.VITE_API_VER}`,
});

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Add ngrok header only for ngrok URLs
    const fullUrl = config.baseURL + (config.url || '');
    if (isNgrokUrl(fullUrl)) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosServices;

export const fetcher = async (args, isValid, cancelToken) => {
  if (isValid === false) {
    return;
  }

  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config, ...cancelToken });

  return res.data;
};

export const fetcherPost = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post(url, { ...config });

  return res.data;
};
