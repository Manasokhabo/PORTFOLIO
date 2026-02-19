
import dbConnect, { Message } from './lib/db';

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === 'POST') {
      const { name, email, message } = req.body;
      
      if (!name || !email || !message) {
        console.error("POST /api/contact - Missing required fields", req.body);
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newMessage = await Message.create({ name, email, message });
      console.log("Inquiry saved successfully:", newMessage._id);
      
      return res.status(201).json({ success: true, id: newMessage._id });
    }

    if (req.method === 'GET') {
      // Admin view of inquiries
      const messages = await Message.find({}).sort({ createdAt: -1 });
      return res.status(200).json(messages);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("CONTACT_API_CRITICAL_FAILURE:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json({ 
      error: 'Failed to process inquiry', 
      debug_info: error.message 
    });
  }
}
