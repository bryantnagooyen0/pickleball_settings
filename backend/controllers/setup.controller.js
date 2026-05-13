import Setup from '../models/setup.model.js';
import mongoose from 'mongoose';

export const getSetups = async (req, res) => {
  const { paddleId, sort = 'likes', page = 1, limit = 20 } = req.query;
  const filter = { isActive: true };
  if (paddleId) filter.paddle = paddleId;
  const sortObj = sort === 'newest' ? { createdAt: -1 } : { likesCount: -1, createdAt: -1 };
  try {
    const setups = await Setup.find(filter)
      .populate('paddle', 'name brand model shape image')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.status(200).json({ success: true, data: setups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getRecentSetups = async (req, res) => {
  try {
    const setups = await Setup.find({ isActive: true })
      .populate('paddle', 'name brand model shape image')
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json({ success: true, data: setups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getPaddlesWithSetups = async (req, res) => {
  try {
    const results = await Setup.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$paddle', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'paddles',
          localField: '_id',
          foreignField: '_id',
          as: 'paddle',
        },
      },
      { $unwind: '$paddle' },
      { $match: { 'paddle.isActive': true } },
      {
        $project: {
          _id: 0,
          paddle: 1,
          count: 1,
        },
      },
    ]);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getSetup = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: 'Invalid Setup ID' });
  }
  try {
    const setup = await Setup.findById(id).populate('paddle', 'name brand model shape image');
    if (!setup || !setup.isActive) {
      return res.status(404).json({ success: false, message: 'Setup not found' });
    }
    res.status(200).json({ success: true, data: setup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createSetup = async (req, res) => {
  const { paddle, leadTapeStrips, leadTapeTotalGrams, overgrip, edgeGuard, totalWeightGrams, notes } = req.body;
  if (!paddle) {
    return res.status(400).json({ success: false, message: 'Paddle is required' });
  }
  try {
    const setup = new Setup({
      paddle,
      author: req.user.id,
      authorName: req.user.username,
      leadTapeStrips: leadTapeStrips || [],
      leadTapeTotalGrams: leadTapeTotalGrams || 0,
      overgrip: overgrip || {},
      edgeGuard: edgeGuard || {},
      totalWeightGrams: totalWeightGrams || 0,
      notes: notes || '',
    });
    await setup.save();
    const populated = await setup.populate('paddle', 'name brand model shape image');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateSetup = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: 'Invalid Setup ID' });
  }
  try {
    const setup = await Setup.findById(id);
    if (!setup || !setup.isActive) {
      return res.status(404).json({ success: false, message: 'Setup not found' });
    }
    if (setup.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const allowed = ['leadTapeStrips', 'leadTapeTotalGrams', 'overgrip', 'edgeGuard', 'totalWeightGrams', 'notes'];
    allowed.forEach(field => { if (req.body[field] !== undefined) setup[field] = req.body[field]; });
    await setup.save();
    res.status(200).json({ success: true, data: setup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteSetup = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: 'Invalid Setup ID' });
  }
  try {
    const setup = await Setup.findById(id);
    if (!setup || !setup.isActive) {
      return res.status(404).json({ success: false, message: 'Setup not found' });
    }
    const isAuthor = setup.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    setup.isActive = false;
    await setup.save();
    res.status(200).json({ success: true, message: 'Setup deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const toggleLike = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: 'Invalid Setup ID' });
  }
  try {
    const setup = await Setup.findById(id);
    if (!setup || !setup.isActive) {
      return res.status(404).json({ success: false, message: 'Setup not found' });
    }
    const userId = req.user.id;
    const alreadyLiked = setup.likes.some(l => l.toString() === userId);
    if (alreadyLiked) {
      setup.likes = setup.likes.filter(l => l.toString() !== userId);
    } else {
      setup.likes.push(userId);
    }
    setup.likesCount = setup.likes.length;
    await setup.save();
    res.status(200).json({ success: true, data: { likesCount: setup.likesCount, liked: !alreadyLiked } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
