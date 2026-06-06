import axios from 'axios';

export const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Configure request/response interceptors as needed
axiosInstance.interceptors.request.use(
  (config) => {
    // Inject headers or log requests here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize external API error structures
    return Promise.reject(error);
  }
);
