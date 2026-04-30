import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: false },
    email: { type: String, sparse: true, trim: true, lowercase: true },
    googleId: { type: String, sparse: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);


