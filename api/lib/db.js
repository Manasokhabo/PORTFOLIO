
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside the Vercel dashboard');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and prevent connection exhaustion in serverless functions.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain a small pool for serverless efficiency
    };

    console.log("Creating new MongoDB connection pool...");
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("MongoDB connection established.");
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error("MongoDB Connection Error:", e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Project Schema
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Message Schema
const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

export default dbConnect;
