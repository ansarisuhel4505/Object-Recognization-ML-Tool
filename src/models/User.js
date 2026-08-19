import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active' },
  apiKey: { type: String, default: null, unique: true, sparse: true } // 🚀 YEH LINE ADD HUI HAI
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);