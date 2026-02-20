import mongoose from 'mongoose';

// MongoDB কানেকশন লজিক (আগে যা ছিল সেম)
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// Settings এর জন্য আলাদা স্কিমা
const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  await connectDB();

  try {
    // GET: সেটিংস ডাটাবেজ থেকে নিয়ে আসা
    if (req.method === 'GET') {
      const { key } = req.query;
      
      if (key) {
        const setting = await Setting.findOne({ key });
        return res.status(200).json(setting ? setting : { key, value: null });
      }
      
      const settings = await Setting.find();
      return res.status(200).json(settings);
    }

    // POST: সেটিংস সেভ বা আপডেট করা
    if (req.method === 'POST') {
      const { key, value } = req.body;
      if (!key || value === undefined) return res.status(400).json({ error: 'Missing fields' });

      // যদি কি (key) আগে থেকেই থাকে তবে আপডেট করবে, নাহলে নতুন বানাবে
      const updatedSetting = await Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
      
      return res.status(200).json(updatedSetting);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('SETTINGS_ERROR:', error);
    return res.status(500).json({ error: 'Internal Error', message: error.message });
  }
}
