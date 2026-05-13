import mongoose from 'mongoose';

const tapeStripSchema = new mongoose.Schema({
  // Outline-arc format: fraction (0–1) of total path length
  t1: { type: Number },
  t2: { type: Number },
  // Signed accumulated arc fraction encoding direction + length of the strip.
  // Positive = forward (increasing t), negative = backward. Null on legacy strips.
  arcFraction: { type: Number, default: null },
  weightGrams: { type: Number, default: 0 },
  lengthInches: { type: Number, default: 0 },
  densityGramsPerInch: { type: Number, default: 0 },
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
      count: { type: Number, default: 0 },
    },
    undergrip: { type: String, default: '' },
    edgeGuard: {
      brand: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    totalWeightGrams: { type: Number, default: 0 },
    setupReasoning: { type: String, default: '', maxlength: 2000 },
    notes: { type: String, default: '', maxlength: 1000 },

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
