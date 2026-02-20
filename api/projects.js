import mongoose from 'mongoose';

// MongoDB Connection Logic
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  // Vercel-এর Environment Variable থেকে MONGODB_URI নিবে
  await mongoose.connect(process.env.MONGODB_URI);
};

// Database Schema/Model
const ProjectSchema = new mongoose.Schema({
  title: String,
  category: String,
  image: String, // এখানে Cloudinary-র দেওয়া ছবির লিঙ্ক সেভ হবে
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export default async function handler(req, res) {
  // ডাটাবেজ কানেক্ট করা
  await connectDB();

  // GET: সব প্রজেক্ট ডাটাবেজ থেকে নিয়ে আসা
  if (req.method === 'GET') {
    try {
      const projects = await Project.find().sort({ createdAt: -1 });
      return res.status(200).json(projects);
    } catch (error) {
      return res.status(500).json({ error: 'Database Error', message: error.message });
    }
  }

  // POST: নতুন প্রজেক্টের তথ্য MongoDB-তে সেভ করা
  if (req.method === 'POST') {
    try {
      const { title, category, image, description } = req.body;
      
      if (!title || !category || !image) {
        return res.status(400).json({ error: 'Missing fields' });
      }

      const newProject = await Project.create({
        title,
        category,
        image, // Cloudinary secure_url এখানে আসবে
        description
      });

      return res.status(201).json(newProject);
    } catch (error) {
      console.error('MONGODB_SAVE_ERROR:', error);
      return res.status(500).json({ 
        error: 'Database Error: Failed to save data to MongoDB', 
        message: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
