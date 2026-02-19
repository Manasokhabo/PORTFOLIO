
import { db } from './lib/db';
import { doc, getDoc, setDoc, collection, getDocs } from 'https://esm.sh/firebase@10.8.1/firestore';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method === 'GET') {
      const { key } = req.query;
      if (key) {
        const docRef = doc(db, 'settings', key);
        const docSnap = await getDoc(docRef);
        return res.status(200).json(docSnap.exists() ? docSnap.data() : { key, value: null });
      }
      const settingsSnap = await getDocs(collection(db, 'settings'));
      const settings = settingsSnap.docs.map(d => ({ key: d.id, ...d.data() }));
      return res.status(200).json(settings);
    }

    if (req.method === 'POST') {
      const { key, value } = req.body;
      if (!key || !value) return res.status(400).json({ error: 'Missing fields' });
      await setDoc(doc(db, 'settings', key), { value });
      return res.status(200).json({ key, value });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Error' });
  }
}

