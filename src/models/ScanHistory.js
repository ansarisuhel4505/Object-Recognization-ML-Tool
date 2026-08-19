import mongoose from 'mongoose';

const ScanHistorySchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String, // AWS/Cloudinary link here
    required: true,
  },
  detectedObjects: [{
    label: String,
    confidence: Number,
    boundingBox: [Number] // Coordinates for green box
  }],
  scanTime: {
    type: Number, // Milliseconds tracking
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ScanHistory || mongoose.model('ScanHistory', ScanHistorySchema);