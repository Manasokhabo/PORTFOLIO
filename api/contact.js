
import { db } from './lib/db';
import { collection, addDoc, getDocs, query, orderBy } from 'https://esm.sh/firebase@10.8.1/firestore';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const messagesCol = collection(db, 'messages');

    if (req.method === 'POST') {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing fields" });
      }
      const docRef = await addDoc(messagesCol, {
        name,
        email,
        message,
        createdAt: new Date().toISOString()
      });
      return res.status(201).json({ success: true, id: docRef.id });
    }

    if (req.method === 'GET') {
      const q = query(messagesCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data()
      }));
      return res.status(200).json(messages);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Database Error', message: error.message });
  }
}
