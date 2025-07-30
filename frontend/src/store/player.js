import {create} from "zustand"

export const usePlayerStore = create((set) => ({
    players: [],
    setPlayers: (players) => set({ players }),
    createPlayer: async (newPlayer) => {
        if (!newPlayer.name || !newPlayer.image || !newPlayer.paddle){
            return {success: false, message: "Please fill in all fields."}
        }
        const res = await fetch("/api/players",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(newPlayer)
        })
        const data = await res.json();
        set((state) => ({products:[...state.players, data.data]}));
        return { success: true, message: "Player created successfully"}
    },

    fetchPlayers: async () => {
        const res = await fetch("/api/players");
        const data = await res.json();
        set({ players: data.data});
    }

}))

