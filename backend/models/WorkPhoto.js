import mongoose from 'mongoose';

const WorkPhotoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  ward: { type: String },
  photoUrl: { type: String, required: true },
  location: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('WorkPhoto', WorkPhotoSchema);
