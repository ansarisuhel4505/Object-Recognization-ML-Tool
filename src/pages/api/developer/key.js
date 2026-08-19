import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import crypto from 'crypto';

export default async function handler(req, res) {
  await dbConnect();
  
  // Check if user is logged in
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const email = session.user.email;

  // GET: Fetch existing API Key
  if (req.method === 'GET') {
    const user = await User.findOne({ email });
    return res.status(200).json({ apiKey: user.apiKey });
  }

  // POST: Generate a new API Key
  if (req.method === 'POST') {
    // Generate a secure 32-character API key
    const newKey = 'sk_live_' + crypto.randomBytes(24).toString('hex');
    
    // Save to Database
    await User.findOneAndUpdate({ email }, { apiKey: newKey });
    
    return res.status(200).json({ success: true, apiKey: newKey, message: "New API Key generated successfully" });
  }

  res.status(405).end();
}