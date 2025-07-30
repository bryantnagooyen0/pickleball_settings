import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    paddle: {
        type: String,
        required: true
    },
    shoes:{
        type: String,
        required: false
    },
    image:{
        type: String,
        required: true
    },
}, {
    timestamps: true // createdAt, updatedAt
});

const Player = mongoose.model('Player', playerSchema);

export default Player;