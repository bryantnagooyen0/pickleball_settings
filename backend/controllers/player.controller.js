import Player from "../models/player.model.js";
import mongoose from "mongoose"

export const getPlayers = async (req,res) => {
    try {
        const players = await Player.find({});
        res.status(200).json({ success: true, data: players});

    } catch (error) {
        console.log("error in fetching players:", error.message);
        res.status(500).json({ success: false, message: "Server Error"});

    }
};

export const createPlayer = async (req, res) => {
    const player = req.body; // user will send this data
    if(!player.name || !player.paddle || !player.image) {
        return res.status(400).json({ success:false, message: "Please provide all fields"});
    }

    const newPlayer = new Player(player)

    try{
        await newPlayer.save();
        res.status(201).json({success: true, data: newPlayer});
    } catch (error){
        console.error("Error in Create Player:", error.message);
        res.status(500).json({ success: false, message: "Server Error"});
    }
};

export const updatePlayer = async (req,res) => {
    const {id} = req.params;

    const player = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({ success: false, message: "Invalid Player Id"});

    }
    try {
        const updatedPlayer = await Player.findByIdAndUpdate(id, player, {new:true});
        res.status(200).json({ success: true, data: updatedPlayer });
    } catch (error){
        res.status(500).json({ success: false, message: "Server Error"});

    }
}

export const deletePlayer = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({ success: false, message: "Invalid Player Id"});
    }

    try {
        await Player.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Player deleted"});
    }catch (error){
        console.log("error in deleting players:", error.message);
        res.status(500).json({ success: false, message: "Server Error"});
    }
}