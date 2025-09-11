import { create } from 'zustand';
import { api } from '../utils/api';

export const usePlayerStore = create(set => ({
  players: [],
  setPlayers: players => set({ players }),

  fetchPlayers: async () => {
    try {
      const data = await api.get('/api/players');
      set({ players: data.data });
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  },

  refreshPlayers: async () => {
    try {
      const data = await api.get('/api/players');
      set({ players: data.data });
    } catch (error) {
      console.error('Error refreshing players:', error);
    }
  },

  createPlayer: async newPlayer => {
    if (!newPlayer.name || !newPlayer.image || !newPlayer.paddle) {
      return { success: false, message: 'Please fill in all fields.' };
    }
    try {
      const data = await api.post('/api/players', newPlayer);
      set(state => ({ players: [...state.players, data.data] }));
      return { success: true, message: 'Player created successfully' };
    } catch (error) {
      console.error('Error creating player:', error);
      return { success: false, message: error.message || 'Failed to create player' };
    }
  },

  updatePlayer: async (playerId, updatedPlayer) => {
    if (!updatedPlayer.name || !updatedPlayer.image || !updatedPlayer.paddle) {
      return { success: false, message: 'Please fill in all required fields.' };
    }
    try {
      const data = await api.put(`/api/players/${playerId}`, updatedPlayer);
      set(state => ({
        players: state.players.map(player =>
          player._id === playerId ? data.data : player
        ),
      }));
      return { success: true, message: 'Player updated successfully' };
    } catch (error) {
      console.error('Error updating player:', error);
      return { success: false, message: error.message || 'Failed to update player' };
    }
  },

  getPlayer: async playerId => {
    try {
      const data = await api.get(`/api/players/${playerId}`);
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error fetching player:', error);
      return { success: false, message: error.message || 'Failed to fetch player' };
    }
  },
}));
