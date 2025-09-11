import { create } from 'zustand';
import { api } from '../utils/api';

export const usePaddleStore = create((set, get) => ({
  paddles: [],
  setPaddles: paddles => set({ paddles }),

  fetchPaddles: async (forceRefresh = false) => {
    const { paddles } = get();
    
    // If we already have paddles and not forcing refresh, don't fetch again
    if (paddles.length > 0 && !forceRefresh) {
      return;
    }
    
    try {
      const data = await api.get('/api/paddles');
      set({ paddles: data.data });
    } catch (error) {
      console.error('Error fetching paddles:', error);
    }
  },

  createPaddle: async newPaddle => {
    try {
      const data = await api.post('/api/paddles', newPaddle);
      set(state => ({ paddles: [...state.paddles, data.data] }));
      return { success: true, message: 'Paddle created successfully' };
    } catch (error) {
      console.error('Error creating paddle:', error);
      return { success: false, message: error.message || 'Failed to create paddle' };
    }
  },

  updatePaddle: async (paddleId, updatedPaddle) => {
    try {
      const data = await api.put(`/api/paddles/${paddleId}`, updatedPaddle);
      set(state => ({
        paddles: state.paddles.map(paddle =>
          paddle._id === paddleId ? data.data : paddle
        ),
      }));

      // Use the message from the backend which includes info about updated players
      return {
        success: true,
        message: data.message || 'Paddle updated successfully',
      };
    } catch (error) {
      console.error('Error updating paddle:', error);
      return { success: false, message: error.message || 'Failed to update paddle' };
    }
  },

  deletePaddle: async paddleId => {
    try {
      await api.delete(`/api/paddles/${paddleId}`);
      set(state => ({
        paddles: state.paddles.filter(paddle => paddle._id !== paddleId),
      }));
      return { success: true, message: 'Paddle deleted successfully' };
    } catch (error) {
      console.error('Error deleting paddle:', error);
      return { success: false, message: error.message || 'Failed to delete paddle' };
    }
  },

  refreshPaddles: async () => {
    try {
      const data = await api.get('/api/paddles');
      set({ paddles: data.data });
    } catch (error) {
      console.error('Error refreshing paddles:', error);
    }
  },

  searchPaddles: async query => {
    try {
      const data = await api.get(`/api/paddles/search?q=${encodeURIComponent(query)}`);
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error searching paddles:', error);
      return { success: false, message: error.message || 'Failed to search paddles' };
    }
  },
}));
