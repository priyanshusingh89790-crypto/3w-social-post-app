import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Attach JWT to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Auth
export const signupApi = (data) => api.post('/api/auth/signup', data);
export const loginApi = (data) => api.post('/api/auth/login', data);
export const getMeApi = () => api.get('/api/auth/me');

// Posts
export const getPostsApi = (page = 1, limit = 10) =>
  api.get(`/api/posts?page=${page}&limit=${limit}`);

// Do NOT set Content-Type manually — Axios sets multipart/form-data with
// the correct boundary automatically when the body is a FormData instance
export const createPostApi = (formData) =>
  api.post('/api/posts', formData);

export const toggleLikeApi = (postId) => api.post(`/api/posts/${postId}/like`);

export const addCommentApi = (postId, text) =>
  api.post(`/api/posts/${postId}/comments`, { text });

// formData must be a FormData instance when an image is involved
export const updatePostApi = (postId, formData) =>
  api.put(`/api/posts/${postId}`, formData);

export const deletePostApi = (postId) =>
  api.delete(`/api/posts/${postId}`);

export default api;
