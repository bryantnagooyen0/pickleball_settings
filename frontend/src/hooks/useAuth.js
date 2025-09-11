import { useEffect } from 'react';
import { create } from 'zustand';

// Shared auth store so all components subscribe to the same state
const useAuthStoreInternal = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  decodeToken: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  isTokenExpired: (token) => {
    const { decodeToken } = get();
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },

  initializeAuth: () => {
    const { isTokenExpired, decodeToken } = get();
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      const decoded = decodeToken(token);
      if (decoded) {
        set({
          user: { id: decoded.id, username: decoded.username, role: decoded.role },
          isAuthenticated: true,
          loading: false,
        });
        return;
      }
    } else if (token && isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('rememberMe');
    }
    set({ loading: false, isAuthenticated: false, user: null });
  },

  login: (token, username, rememberMe = false) => {
    const { decodeToken } = get();
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
    const decoded = decodeToken(token);
    if (decoded) {
      set({
        user: { id: decoded.id, username: decoded.username, role: decoded.role },
        isAuthenticated: true,
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    set({ user: null, isAuthenticated: false });
  },

  hasRole: (role) => {
    const { user } = get();
    return user && user.role === role;
  },

  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
}));

// Public hook that initializes once per app load and subscribes to store state
export const useAuth = () => {
  const state = useAuthStoreInternal();

  useEffect(() => {
    state.initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
};
