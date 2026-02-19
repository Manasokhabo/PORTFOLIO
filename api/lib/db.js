
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is missing from Vercel environment variables.');
}

let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 1,
      // Increased timeout to help with initial connection from Vercel
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 30000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('MongoDB Connected Successfully');
      return m;
    }).catch(err => {
      cached.promise = null; 
      console.error('MongoDB Connection Error:', err.message);
      throw new Error(`Database connection failed: ${err.message}`);
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

export default dbConnect;
