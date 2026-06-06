import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  ward: { type: String },
  worker: { type: String },
  raw_data: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Rating', RatingSchema);
