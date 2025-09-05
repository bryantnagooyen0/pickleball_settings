import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    paddle: {
      type: String,
      required: true,
    },
    paddleShape: {
      type: String,
      required: false,
    },
    paddleThickness: {
      type: String,
      required: false,
    },
    paddleHandleLength: {
      type: String,
      required: false,
    },
    paddleLength: {
      type: String,
      required: false,
    },
    paddleWidth: {
      type: String,
      required: false,
    },
    paddleColor: {
      type: String,
      required: false,
    },
    paddleImage: {
      type: String,
      required: false,
    },
    paddleCore: {
      type: String,
      required: false,
    },
    paddleWeight: {
      type: String,
      required: false,
    },
    paddleBrand: {
      type: String,
      required: false,
    },
    paddleModel: {
      type: String,
      required: false,
    },
    shoes: {
      type: String,
      required: false,
    },
    shoeImage: {
      type: String,
      required: false,
    },
    shoeModel: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: false,
    },
    height: {
      type: String,
      required: false,
    },
    mlpTeam: {
      type: String,
      required: false,
    },
    currentLocation: {
      type: String,
      required: false,
    },
    about: {
      type: String,
      required: false,
    },
    overgrips: {
      type: String,
      required: false,
    },
    weight: {
      type: String,
      required: false,
    },
    sponsor: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Player = mongoose.model('Player', playerSchema);

export default Player;
