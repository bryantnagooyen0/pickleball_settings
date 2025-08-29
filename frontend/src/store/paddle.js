import { create } from 'zustand';

export const usePaddleStore = create(set => ({
  paddles: [],
  setPaddles: paddles => set({ paddles }),
  
  fetchPaddles: async () => {
    try {
      const res = await fetch('/api/paddles');
      const data = await res.json();
      if (res.ok) {
        set({ paddles: data.data });
      }
    } catch (error) {
      console.error('Error fetching paddles:', error);
    }
  },

  createPaddle: async newPaddle => {
    try {
      const res = await fetch('/api/paddles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPaddle),
      });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ paddles: [...state.paddles, data.data] }));
        return { success: true, message: 'Paddle created successfully' };
      } else {
        return { success: false, message: data.message || 'Failed to create paddle' };
      }
    } catch (error) {
      console.error('Error creating paddle:', error);
      return { success: false, message: 'Failed to create paddle' };
    }
  },

  updatePaddle: async (paddleId, updatedPaddle) => {
    try {
      const res = await fetch(`/api/paddles/${paddleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPaddle),
      });
      const data = await res.json();
      if (res.ok) {
        set(state => ({
          paddles: state.paddles.map(paddle => 
            paddle._id === paddleId ? data.data : paddle
          )
        }));
        
        // Use the message from the backend which includes info about updated players
        return { success: true, message: data.message || 'Paddle updated successfully' };
      } else {
        return { success: false, message: data.message || 'Failed to update paddle' };
      }
    } catch (error) {
      console.error('Error updating paddle:', error);
      return { success: false, message: 'Failed to update paddle' };
    }
  },

  deletePaddle: async paddleId => {
    try {
      const res = await fetch(`/api/paddles/${paddleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        set(state => ({
          paddles: state.paddles.filter(paddle => paddle._id !== paddleId)
        }));
        return { success: true, message: 'Paddle deleted successfully' };
      } else {
        const data = await res.json();
        return { success: false, message: data.message || 'Failed to delete paddle' };
      }
    } catch (error) {
      console.error('Error deleting paddle:', error);
      return { success: false, message: 'Failed to delete paddle' };
    }
  },

  searchPaddles: async query => {
    try {
      const res = await fetch(`/api/paddles/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Failed to search paddles' };
      }
    } catch (error) {
      console.error('Error searching paddles:', error);
      return { success: false, message: 'Failed to search paddles' };
    }
  },
}));
