import { create } from 'zustand';

export const usePlayerStore = create(set => ({
  players: [],
  setPlayers: players => set({ players }),
  createPlayer: async newPlayer => {
    if (!newPlayer.name || !newPlayer.image || !newPlayer.paddle) {
      return { success: false, message: 'Please fill in all fields.' };
    }
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPlayer),
    });
    const data = await res.json();
    set(state => ({ products: [...state.players, data.data] }));
    return { success: true, message: 'Player created successfully' };
  },

  updatePlayer: async (playerId, updatedPlayer) => {
    if (!updatedPlayer.name || !updatedPlayer.image || !updatedPlayer.paddle) {
      return { success: false, message: 'Please fill in all required fields.' };
    }
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
        )
      }));
      return { success: true, message: 'Player updated successfully' };
    } else {
      return { success: false, message: data.message || 'Failed to update player' };
    }
  },

  fetchPlayers: async () => {
    const res = await fetch('/api/players');
    const data = await res.json();
    set({ players: data.data });
  },
}));
