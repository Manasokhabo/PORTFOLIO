import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your Mongo URI to Vercel Environment Variables');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongoose) => {
      console.log('MongoDB Connected via Mongoose');
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
