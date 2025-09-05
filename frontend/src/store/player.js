import { create } from 'zustand';

export const usePlayerStore = create(set => ({
  players: [],
  setPlayers: players => set({ players }),

  fetchPlayers: async () => {
    try {
      const res = await fetch('/api/players');
      const data = await res.json();
      if (res.ok) {
        set({ players: data.data });
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  },

  refreshPlayers: async () => {
    try {
      const res = await fetch('/api/players');
      const data = await res.json();
      if (res.ok) {
        set({ players: data.data });
      }
    } catch (error) {
      console.error('Error refreshing players:', error);
    }
  },

  createPlayer: async newPlayer => {
    if (!newPlayer.name || !newPlayer.image || !newPlayer.paddle) {
      return { success: false, message: 'Please fill in all fields.' };
    }
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlayer),
      });
      const data = await res.json();
      if (res.ok) {
        set(state => ({ players: [...state.players, data.data] }));
        return { success: true, message: 'Player created successfully' };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to create player',
        };
      }
    } catch (error) {
      console.error('Error creating player:', error);
      return { success: false, message: 'Failed to create player' };
    }
  },

  updatePlayer: async (playerId, updatedPlayer) => {
    if (!updatedPlayer.name || !updatedPlayer.image || !updatedPlayer.paddle) {
      return { success: false, message: 'Please fill in all required fields.' };
    }
    try {
      const res = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPlayer),
      });
      const data = await res.json();
      if (res.ok) {
        set(state => ({
          players: state.players.map(player =>
            player._id === playerId ? data.data : player
          ),
        }));
        return { success: true, message: 'Player updated successfully' };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to update player',
        };
      }
    } catch (error) {
      console.error('Error updating player:', error);
      return { success: false, message: 'Failed to update player' };
    }
  },

  getPlayer: async playerId => {
    try {
      const res = await fetch(`/api/players/${playerId}`);
      const data = await res.json();
      if (res.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch player',
        };
      }
    } catch (error) {
      console.error('Error fetching player:', error);
      return { success: false, message: 'Failed to fetch player' };
    }
  },
}));
