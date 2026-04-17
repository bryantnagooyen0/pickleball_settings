import { create } from 'zustand';
import { api } from '../utils/api';

export const useSetupStore = create((set) => ({
  setups: [],
  paddlesWithSetups: [],
  recentSetups: [],

  fetchSetups: async (paddleId, sort = 'likes') => {
    try {
      const query = new URLSearchParams({ sort });
      if (paddleId) query.set('paddleId', paddleId);
      const data = await api.get(`/api/setups?${query}`);
      set({ setups: data.data });
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  fetchRecentSetups: async () => {
    try {
      const data = await api.get('/api/setups/recent');
      set({ recentSetups: data.data });
    } catch (error) {
      console.error('Error fetching recent setups:', error);
    }
  },

  fetchPaddlesWithSetups: async () => {
    try {
      const data = await api.get('/api/setups/paddles-with-setups');
      set({ paddlesWithSetups: data.data });
    } catch (error) {
      console.error('Error fetching paddles with setups:', error);
    }
  },

  createSetup: async (setupData) => {
    try {
      const data = await api.post('/api/setups', setupData);
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateSetup: async (setupId, setupData) => {
    try {
      const data = await api.put(`/api/setups/${setupId}`, setupData);
      set((state) => ({
        setups: state.setups.map((s) => (s._id === setupId ? data.data : s)),
      }));
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteSetup: async (setupId) => {
    try {
      await api.delete(`/api/setups/${setupId}`);
      set((state) => ({
        setups: state.setups.filter((s) => s._id !== setupId),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  toggleLike: async (setupId) => {
    try {
      const data = await api.post(`/api/setups/${setupId}/like`, {});
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
}));
