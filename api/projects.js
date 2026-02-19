
import dbConnect, { Project } from './lib/db';

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      const projects = await Project.find({}).sort({ createdAt: -1 });
      return res.status(200).json(projects);
    }

    if (req.method === 'POST') {
      const { title, category, image, description } = req.body;
      
      if (!title || !category || !image) {
        console.error("POST /api/projects - Missing required fields", req.body);
        return res.status(400).json({ error: 'Title, Category, and Image URL are required' });
      }

      // 'image' is expected to be a Cloudinary URL string, not raw bytes
      const newProject = await Project.create({
        title,
        category,
        image,
        description
      });
      
      console.log("Project created successfully:", newProject._id);
      return res.status(201).json(newProject);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("PROJECTS_API_CRITICAL_FAILURE:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
