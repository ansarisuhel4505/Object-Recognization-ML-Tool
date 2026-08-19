import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  // 🚀 NAYA FEATURE: Developer API Key
  apiKey: { type: String, unique: true, sparse: true } 
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);