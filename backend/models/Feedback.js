import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  fromUserId: { type: String, required: true },
  fromUserName: { type: String, default: 'Unknown' },
  workerName: { type: String, default: 'Regional Team' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Feedback', FeedbackSchema);
