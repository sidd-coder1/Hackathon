import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: 'Unknown' },
  ward: { type: String, default: 'Unassigned' },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Report', ReportSchema);
