import Joi from 'joi';

// Player validation schema
export const validatePlayer = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    paddle: Joi.string().trim().max(100).required(),
    image: Joi.string().uri().required(),
    age: Joi.number().integer().min(1).max(120).optional(),
    height: Joi.string().max(20).optional(),
    // Add other fields as needed
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

// Comment validation schema
export const validateComment = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().trim().min(1).max(1000).required(),
    targetType: Joi.string().valid('player', 'paddle').required(),
    targetId: Joi.string().required(),
    parentCommentId: Joi.string().optional()
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
