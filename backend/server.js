import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load models
import User from './models/User.js';
import Attendance from './models/Attendance.js';
import Task from './models/Task.js';
import Report from './models/Report.js';
import Feedback from './models/Feedback.js';
import Location from './models/Location.js';
import WorkPhoto from './models/WorkPhoto.js';
import Rating from './models/Rating.js';
import Checkpoint from './models/Checkpoint.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname || '.jpg'));
  }
});
const upload = multer({ storage });

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected to:', process.env.MONGO_URI))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API ROUTES ---

// 1. File Upload Route
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// 2. User Routes
app.get('/api/users', async (req, res) => {
  try {
    const role = req.query.role;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/uid/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/employeeId/:employeeId', async (req, res) => {
  try {
    const user = await User.findOne({ employeeId: req.params.employeeId });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const saved = await newUser.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      // Try deleting by uid
      const deletedByUid = await User.findOneAndDelete({ uid: req.params.id });
      if (!deletedByUid) return res.status(404).json({ error: 'User not found' });
      return res.json(deletedByUid);
    }
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/stats', async (req, res) => {
  try {
    const { score, streak, totalAttendance, level } = req.body;
    // Find by either _id or uid
    let user = await User.findById(req.params.id);
    if (!user) {
      user = await User.findOne({ uid: req.params.id });
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (score !== undefined) user.score = score;
    if (streak !== undefined) user.streak = streak;
    if (totalAttendance !== undefined) user.totalAttendance = totalAttendance;
    if (level !== undefined) user.level = level;
    
    const updated = await user.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/users/uid/:uid/reward', async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.score = (user.score || 0) + parseInt(points || 0);
    // Level calculation helper logic
    const calculateLevel = (score) => {
      if (score <= 50) return 1;
      if (score <= 150) return 2;
      return 3;
    };
    user.level = calculateLevel(user.score);
    
    const updated = await user.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Attendance Routes
app.get('/api/attendance', async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ timestamp: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attendance/user/:userId', async (req, res) => {
  try {
    // Queries can be by _id/uid or employeeId. We search both fields.
    const attendance = await Attendance.find({
      $or: [{ userId: req.params.userId }, { userName: req.params.userId }]
    }).sort({ timestamp: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attendance/check', async (req, res) => {
  try {
    const { userId, date } = req.query;
    const record = await Attendance.findOne({ userId, date });
    res.json({ exists: !!record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const record = new Attendance(req.body);
    const saved = await record.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Task Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    const saved = await task.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tasks/:id/complete', async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tasks/:id/verify', async (req, res) => {
  try {
    const { verifiedBy } = req.body;
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { status: 'verified', verifiedBy, verifiedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Report Routes
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const report = new Report(req.body);
    const saved = await report.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Feedback Routes
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    const saved = await feedback.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Location Routes
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.find().sort({ timestamp: -1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/locations/user/:userId', async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/locations/live/:userId', async (req, res) => {
  try {
    const latest = await Location.findOne({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/locations', async (req, res) => {
  try {
    const location = new Location(req.body);
    const saved = await location.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Work Photo Routes
app.get('/api/work-photos', async (req, res) => {
  try {
    const photos = await WorkPhoto.find().sort({ timestamp: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/work-photos', async (req, res) => {
  try {
    const photo = new WorkPhoto(req.body);
    const saved = await photo.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 9. Rating Routes
app.get('/api/ratings', async (req, res) => {
  try {
    const ratings = await Rating.find().sort({ timestamp: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ratings', async (req, res) => {
  try {
    const rating = new Rating(req.body);
    const saved = await rating.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 10. Checkpoint Routes
app.get('/api/worker-checkpoints', async (req, res) => {
  try {
    const checkpoints = await Checkpoint.find().sort({ timestamp: -1 });
    res.json(checkpoints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/worker-checkpoints', async (req, res) => {
  try {
    const checkpoint = new Checkpoint(req.body);
    const saved = await checkpoint.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
