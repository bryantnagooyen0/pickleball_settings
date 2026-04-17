import mongoose from 'mongoose';

const tapeStripSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  weightGrams: { type: Number, default: 0 },
  label: { type: String, default: '' },
}, { _id: false });

const setupSchema = new mongoose.Schema(
  {
    paddle: { type: mongoose.Schema.Types.ObjectId, ref: 'Paddle', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },

    leadTapeStrips: [tapeStripSchema],
    leadTapeTotalGrams: { type: Number, default: 0 },

    overgrip: {
      brand: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    edgeGuard: {
      brand: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    totalWeightGrams: { type: Number, default: 0 },
    notes: { type: String, default: '', maxlength: 1000 },

    photoUrl: { type: String, default: '' },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

setupSchema.index({ paddle: 1, likesCount: -1 });
setupSchema.index({ paddle: 1, createdAt: -1 });
setupSchema.index({ author: 1 });
setupSchema.index({ createdAt: -1 });

const Setup = mongoose.model('Setup', setupSchema);
export default Setup;
