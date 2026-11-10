import { apiClient } from './api';

export const authService = {
  async login(username, password) {
    const response = await apiClient.post('/auth/login/', {
      username,
      password,
    });
    const { access, refresh } = response.data;
    if (access) {
      localStorage.setItem('novaretail_access_token', access);
      if (refresh) {
        localStorage.setItem('novaretail_refresh_token', refresh);
      }
      localStorage.setItem('novaretail_username', username);
    }
    return response.data;
  },

  async register(username, email, password) {
    const response = await apiClient.post('/auth/register/', {
      username,
      email,
      password,
    });
    return response.data;
  },

  async refreshToken() {
    const refresh = localStorage.getItem('novaretail_refresh_token');
    if (!refresh) throw new Error('No refresh token available');
    const response = await apiClient.post('/auth/refresh/', { refresh });
    const { access } = response.data;
    if (access) {
      localStorage.setItem('novaretail_access_token', access);
    }
    return access;
  },

  logout() {
    localStorage.removeItem('novaretail_access_token');
    localStorage.removeItem('novaretail_refresh_token');
    localStorage.removeItem('novaretail_username');
  },

  getAccessToken() {
    return localStorage.getItem('novaretail_access_token');
  },

  getUsername() {
    return localStorage.getItem('novaretail_username');
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem('novaretail_access_token'));
  }
};
