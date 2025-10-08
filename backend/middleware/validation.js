import Joi from 'joi';

// Player validation schema
export const validatePlayer = (req, res, next) => {
  const schema = Joi.object({
    _id: Joi.string().optional(),
    name: Joi.string().trim().min(1).max(100).required(),
    paddle: Joi.string().trim().max(100).required(),
    image: Joi.string().uri().required(),
    age: Joi.number().integer().min(1).max(120).allow('', null).optional().custom((value, helpers) => {
      // Convert empty string to null
      if (value === '') {
        return null;
      }
      return value;
    }),
    height: Joi.string().max(20).allow('').optional(),
    mlpTeam: Joi.string().max(100).allow('').optional(),
    currentLocation: Joi.string().max(100).allow('').optional(),
    about: Joi.string().max(1000).allow('').optional(),
    sponsor: Joi.string().max(100).allow('').optional(),
    // Paddle fields
    paddleShape: Joi.string().max(100).allow('').optional(),
    paddleThickness: Joi.string().max(100).allow('').optional(),
    paddleHandleLength: Joi.string().max(100).allow('').optional(),
    paddleLength: Joi.string().max(100).allow('').optional(),
    paddleWidth: Joi.string().max(100).allow('').optional(),
    paddleColor: Joi.string().max(100).allow('').optional(),
    paddleImage: Joi.string().uri().allow('').optional(),
    paddleCore: Joi.string().max(100).allow('').optional(),
    paddleWeight: Joi.string().max(100).allow('').optional(),
    paddleBrand: Joi.string().max(100).allow('').optional(),
    paddleModel: Joi.string().max(100).allow('').optional(),
    // Shoe fields
    shoes: Joi.string().max(100).allow('').optional(),
    shoeImage: Joi.string().uri().allow('').optional(),
    shoeModel: Joi.string().max(100).allow('').optional(),
    // Modification fields
    overgrips: Joi.string().max(500).allow('').optional(),
    overgripImage: Joi.string().uri().allow('').optional(),
    weight: Joi.string().max(500).allow('').optional(),
    weightImage: Joi.string().uri().allow('').optional(),
    totalWeight: Joi.string().max(100).allow('').optional(),
    weightLocation: Joi.string().max(100).allow('').optional(),
    tapeDetails: Joi.string().max(1000).allow('').optional(),
    additionalModification: Joi.string().max(500).allow('').optional(),
    additionalModificationImage: Joi.string().uri().allow('').optional(),
    // Additional fields that might be present
    slug: Joi.string().allow('').optional(),
    paddlePriceLink: Joi.string().uri().allow('').optional(),
    // MongoDB/Mongoose fields
    __v: Joi.number().optional(),
    // Timestamps
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  }).unknown(true); // Allow unknown fields to pass through

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

// Comment validation schema
export const validateComment = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().trim().min(1).max(1000).required(),
    targetType: Joi.string().valid('player', 'paddle').required(),
    targetId: Joi.string().required(),
    parentCommentId: Joi.string().allow(null).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};
