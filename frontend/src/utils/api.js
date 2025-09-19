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
    
    // Handle different response types
    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
    
    if (response.status === 429) {
      throw new Error('Too many requests. Please slow down.');
    }
    
    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
    }
    
    const text = await response.text();
    if (!text) {
      throw new Error(`Server returned empty response. Status: ${response.status}`);
    }
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Keep-alive function to prevent Render from sleeping
export const keepAlive = async () => {
  try {
    const baseUrl = getApiBaseUrl();
    if (baseUrl) {
      await fetch(`${baseUrl}/ping`, { method: 'GET' });
    }
  } catch (error) {
    console.log('Keep-alive ping failed:', error.message);
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
