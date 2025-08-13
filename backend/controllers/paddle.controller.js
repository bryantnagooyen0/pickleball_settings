import Paddle from "../models/paddle.model.js";
import mongoose from "mongoose";

export const getPaddles = async (req, res) => {
    try {
        const paddles = await Paddle.find({ isActive: true }).sort({ brand: 1, model: 1 });
        res.status(200).json({ success: true, data: paddles });
    } catch (error) {
        console.log("error in fetching paddles:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getPaddle = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Paddle Id" });
    }

    try {
        const paddle = await Paddle.findById(id);
        if (!paddle) {
            return res.status(404).json({ success: false, message: "Paddle not found" });
        }
        res.status(200).json({ success: true, data: paddle });
    } catch (error) {
        console.log("error in fetching paddle:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createPaddle = async (req, res) => {
    const paddleData = req.body;
    
    if (!paddleData.name || !paddleData.brand) {
        return res.status(400).json({ 
            success: false, 
            message: "Please provide name and brand" 
        });
    }

    try {
        const newPaddle = new Paddle(paddleData);
        await newPaddle.save();
        res.status(201).json({ success: true, data: newPaddle });
    } catch (error) {
        console.error("Error in Create Paddle:", error.message);
        if (error.code === 11000) {
            res.status(400).json({ 
                success: false, 
                message: "A paddle with this brand and model already exists" 
            });
        } else {
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }
};

export const updatePaddle = async (req, res) => {
    const { id } = req.params;
    const paddleData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Paddle Id" });
    }

    try {
        const updatedPaddle = await Paddle.findByIdAndUpdate(id, paddleData, { new: true });
        if (!updatedPaddle) {
            return res.status(404).json({ success: false, message: "Paddle not found" });
        }
        res.status(200).json({ success: true, data: updatedPaddle });
    } catch (error) {
        console.error("Error in Update Paddle:", error.message);
        if (error.code === 11000) {
            res.status(400).json({ 
                success: false, 
                message: "A paddle with this brand and model already exists" 
            });
        } else {
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }
};

export const deletePaddle = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Paddle Id" });
    }

    try {
        // Soft delete by setting isActive to false
        const paddle = await Paddle.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!paddle) {
            return res.status(404).json({ success: false, message: "Paddle not found" });
        }
        res.status(200).json({ success: true, message: "Paddle deleted successfully" });
    } catch (error) {
        console.log("error in deleting paddle:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const searchPaddles = async (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return res.status(400).json({ success: false, message: "Search query is required" });
    }

    try {
        const paddles = await Paddle.find({
            isActive: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } },
                { model: { $regex: q, $options: 'i' } }
            ]
        }).sort({ brand: 1, model: 1 });
        
        res.status(200).json({ success: true, data: paddles });
    } catch (error) {
        console.log("error in searching paddles:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
