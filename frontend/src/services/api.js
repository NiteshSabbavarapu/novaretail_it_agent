import axios from 'axios';

/**
 * Normalizes the API base URL:
 * - Trims whitespace and trailing slashes.
 * - Appends '/api' if given an absolute URL that does not end in '/api',
 *   matching Django's root urls.py (path("api/", include("core.urls"))).
 */
export function normalizeApiUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '/api';
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return '/api';

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return trimmed;
}

/**
 * Determines the effective API base URL.
 * Priority:
 * 1. Environment variable VITE_API_BASE_URL (set in Vercel or .env)
 * 2. User-configured override from localStorage (Settings page)
 * 3. Default fallback to '/api' (local Vite dev proxy)
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('novaretail_api_url') : null;

  // In production or when VITE_API_BASE_URL is set:
  // Prefer the environment variable unless the user explicitly configured
  // a custom remote backend in localStorage that isn't old localhost/default
  if (envUrl) {
    if (
      storedUrl &&
      storedUrl !== '/api' &&
      !storedUrl.includes('localhost') &&
      !storedUrl.includes('127.0.0.1')
    ) {
      return normalizeApiUrl(storedUrl);
    }
    return normalizeApiUrl(envUrl);
  }

  if (storedUrl) {
    return normalizeApiUrl(storedUrl);
  }

  return '/api';
}

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Request interceptor: dynamically synchronize baseURL and attach JWT Authorization header
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('novaretail_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: automatically refresh JWT token on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('novaretail_refresh_token');
      if (refreshToken) {
        try {
          const currentBaseUrl = getApiBaseUrl();
          const res = await axios.post(`${currentBaseUrl}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newToken = res.data.access;
          if (newToken) {
            localStorage.setItem('novaretail_access_token', newToken);
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('novaretail_access_token');
          localStorage.removeItem('novaretail_refresh_token');
          localStorage.removeItem('novaretail_username');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } else {
        localStorage.removeItem('novaretail_access_token');
        localStorage.removeItem('novaretail_username');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
