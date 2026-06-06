import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  assignedTo: { type: String, required: true },
  workerName: { type: String },
  assignedBy: { type: String },
  assignedById: { type: String },
  ward: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  points: { type: Number, default: 10 },
  status: { type: String, enum: ['pending', 'completed', 'verified'], default: 'pending' },
  dateFrom: { type: String },
  dateTo: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  verifiedBy: { type: String },
  verifiedAt: { type: Date }
});

export default mongoose.model('Task', TaskSchema);
