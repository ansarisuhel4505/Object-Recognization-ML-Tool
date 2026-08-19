import mongoose from 'mongoose';

const flaggedDataSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true }, // The image where AI failed
  predictedLabel: { type: String, required: true }, // What AI wrongly thought it was
  userEmail: { type: String, required: true }, // Who reported it
  status: { type: String, enum: ['pending_review', 'retrained', 'discarded'], default: 'pending_review' }
}, { timestamps: true });

export default mongoose.models.FlaggedData || mongoose.model('FlaggedData', flaggedDataSchema);