import mongoose from 'mongoose';

const CheckpointSchema = new mongoose.Schema({
  workerId: { type: String, required: true },
  workerName: { type: String },
  checkpoint: { type: String },
  raw_data: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Checkpoint', CheckpointSchema);
