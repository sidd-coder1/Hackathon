import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Location', LocationSchema);
