import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Store plain text for simplicity/demo bypass, matching frontend logic
  role: { type: String, required: true },
  ward: { type: String },
  employeeId: { type: String },
  score: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  totalAttendance: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
