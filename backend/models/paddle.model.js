import mongoose from 'mongoose';

const paddleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: false,
    },
    shape: {
      type: String,
      required: false,
    },
    thickness: {
      type: String,
      required: false,
    },
    handleLength: {
      type: String,
      required: false,
    },
    length: {
      type: String,
      required: false,
    },
    width: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      required: false,
    },
    weight: {
      type: String,
      required: false,
    },
    core: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// No compound unique index - allow same brand/model with different specifications

const Paddle = mongoose.model('Paddle', paddleSchema);

export default Paddle;
