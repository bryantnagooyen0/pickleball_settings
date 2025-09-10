import Paddle from '../models/paddle.model.js';
import Player from '../models/player.model.js';
import mongoose from 'mongoose';

export const getPaddles = async (req, res) => {
  try {
    const paddles = await Paddle.find({ isActive: true }).sort({
      brand: 1,
      model: 1,
    });
    res.status(200).json({ success: true, data: paddles });
  } catch (error) {
    console.log('error in fetching paddles:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getPaddle = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: 'Invalid Paddle Id' });
  }

  try {
    const paddle = await Paddle.findById(id);
    if (!paddle) {
      return res
        .status(404)
        .json({ success: false, message: 'Paddle not found' });
    }
    res.status(200).json({ success: true, data: paddle });
  } catch (error) {
    console.log('error in fetching paddle:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createPaddle = async (req, res) => {
  const paddleData = req.body;

  if (!paddleData.name || !paddleData.brand) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name and brand',
    });
  }

  try {
    const newPaddle = new Paddle(paddleData);
    await newPaddle.save();
    res.status(201).json({ success: true, data: newPaddle });
  } catch (error) {
    console.error('Error in Create Paddle:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updatePaddle = async (req, res) => {
  const { id } = req.params;
  const paddleData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: 'Invalid Paddle Id' });
  }

  try {
    // First, get the original paddle to find players using it
    const originalPaddle = await Paddle.findById(id);
    if (!originalPaddle) {
      return res
        .status(404)
        .json({ success: false, message: 'Paddle not found' });
    }

    // Update the paddle template
    const updatedPaddle = await Paddle.findByIdAndUpdate(id, paddleData, {
      new: true,
    });

    // Find all players who are using this paddle (matching name, shape, and thickness) and update their paddle specifications
    const playersToUpdate = await Player.find({
      paddle: originalPaddle.name,
      ...(originalPaddle.shape && { paddleShape: originalPaddle.shape }),
      ...(originalPaddle.thickness && { paddleThickness: originalPaddle.thickness })
    });

    if (playersToUpdate.length > 0) {
      const updatePromises = playersToUpdate.map(player => {
        const playerUpdate = {
          paddleBrand: paddleData.brand || player.paddleBrand,
          paddleModel: paddleData.model || player.paddleModel,
          paddleShape: paddleData.shape || player.paddleShape,
          paddleThickness: paddleData.thickness || player.paddleThickness,
          paddleHandleLength:
            paddleData.handleLength || player.paddleHandleLength,
          paddleLength: paddleData.length || player.paddleLength,
          paddleWidth: paddleData.width || player.paddleWidth,
          paddleCore: paddleData.core || player.paddleCore,
          paddleImage: paddleData.image || player.paddleImage,
        };

        return Player.findByIdAndUpdate(player._id, playerUpdate, {
          new: true,
        });
      });

      await Promise.all(updatePromises);
      console.log(
        `Updated ${playersToUpdate.length} players using paddle: ${originalPaddle.name}`
      );
    }

    res.status(200).json({
      success: true,
      data: updatedPaddle,
      message: `Paddle updated successfully. ${playersToUpdate.length} players using this paddle were also updated.`,
    });
  } catch (error) {
    console.error('Error in Update Paddle:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deletePaddle = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: 'Invalid Paddle Id' });
  }

  try {
    // Soft delete by setting isActive to false
    const paddle = await Paddle.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!paddle) {
      return res
        .status(404)
        .json({ success: false, message: 'Paddle not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Paddle deleted successfully' });
  } catch (error) {
    console.log('error in deleting paddle:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const searchPaddles = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res
      .status(400)
      .json({ success: false, message: 'Search query is required' });
  }

  try {
    const paddles = await Paddle.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } },
      ],
    }).sort({ brand: 1, model: 1 });

    res.status(200).json({ success: true, data: paddles });
  } catch (error) {
    console.log('error in searching paddles:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
