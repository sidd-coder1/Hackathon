import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const users = [
  {
    uid: 'citizen_uid',
    name: 'Rajesh Kumar',
    email: 'citizen@example.com',
    password: 'password',
    role: 'user',
    ward: 'Sector 7 – Green Park',
    employeeId: 'CITIZEN1',
    score: 0,
    streak: 0,
    totalAttendance: 0,
    level: 1
  },
  {
    uid: 'worker_uid',
    name: 'Amit Singh',
    email: 'worker@example.com',
    password: 'password',
    role: 'worker',
    ward: 'Ward 14 – Karol Bagh',
    employeeId: 'WORKER14',
    score: 0,
    streak: 0,
    totalAttendance: 0,
    level: 1
  },
  {
    uid: 'supervisor_uid',
    name: 'Sanjay Sharma',
    email: 'supervisor@example.com',
    password: 'password',
    role: 'supervisor',
    ward: 'Municipal HQ',
    employeeId: 'SUPERVISOR1',
    score: 0,
    streak: 0,
    totalAttendance: 0,
    level: 1
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swachhdrishti');
    console.log('Connected to MongoDB for seeding.');
    
    await User.deleteMany({});
    console.log('Cleaned users collection.');
    
    await User.insertMany(users);
    console.log('Inserted seed users successfully!');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

seed();
