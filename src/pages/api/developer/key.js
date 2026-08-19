import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import crypto from "crypto";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  await dbConnect();

  if (req.method === 'GET') {
    // Return existing key
    const user = await User.findOne({ email: session.user.email });
    return res.status(200).json({ apiKey: user?.apiKey || null });
  } 
  else if (req.method === 'POST') {
    // Generate new key
    const newApiKey = "sk_live_" + crypto.randomBytes(24).toString('hex');
    await User.findOneAndUpdate(
      { email: session.user.email },
      { apiKey: newApiKey }
    );
    return res.status(200).json({ apiKey: newApiKey, message: "API Key Generated!" });
  }
}