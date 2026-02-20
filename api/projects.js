import dbConnect from './lib/mongodb';
import mongoose from 'mongoose';

// Schema ডিফাইন করা (যদি আগে না করা থাকে)
const ProjectSchema = new mongoose.Schema({
  title: String,
  category: String,
  image: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export default async function handler(req, res) {
  // ১. ডাটাবেজ কানেক্ট করা
  try {
    await dbConnect();
  } catch (dbErr) {
    return res.status(500).json({ error: "Database Connection Failed", details: dbErr.message });
  }

  // ২. GET Request: সব প্রজেক্ট ডাটাবেজ থেকে নিয়ে আসা
  if (req.method === 'GET') {
    try {
      const projects = await Project.find().sort({ createdAt: -1 });
      return res.status(200).json(projects);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
  }

  // ৩. POST Request: নতুন প্রজেক্ট সেভ করা
  if (req.method === 'POST') {
    try {
      const { title, category, image, description } = req.body;
      if (!title || !category || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newProject = await Project.create({ title, category, image, description });
      return res.status(201).json(newProject);
    } catch (error) {
      return res.status(500).json({ error: "Failed to save project" });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
