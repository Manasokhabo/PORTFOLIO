
import { db } from './lib/db';
import { collection, getDocs, addDoc, query, orderBy } from 'https://esm.sh/firebase@10.8.1/firestore';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const projectsCol = collection(db, 'projects');

    if (req.method === 'GET') {
      const q = query(projectsCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return res.status(200).json(projects);
    }

    if (req.method === 'POST') {
      const { title, category, image, description } = req.body;
      if (!title || !category || !image) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      const newDoc = await addDoc(projectsCol, {
        title,
        category,
        image,
        description,
        createdAt: new Date().toISOString()
      });
      return res.status(201).json({ id: newDoc.id, title, category, image, description });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('FIREBASE_PROJECTS_ERROR:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
