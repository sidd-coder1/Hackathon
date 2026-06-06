import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  role: { type: String },
  ward: { type: String },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  timestamp: { type: Date, default: Date.now },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  qrToken: { type: String },
  verified: { type: Boolean, default: true }
});

// Compound index to ensure uniqueness per user per date
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', AttendanceSchema);
