// API utility functions for handling different environments

const getApiBaseUrl = () => {
  // In production, use the environment variable or fallback to a default
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://pickleball-settings.onrender.com';
  }
  
  // In development, use the proxy (relative URL)
  return '';
};

export const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Convenience methods
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
