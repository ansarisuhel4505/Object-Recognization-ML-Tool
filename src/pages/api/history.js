import dbConnect from '../../lib/mongodb';
import ScanHistory from '../../models/ScanHistory';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  // 🔒 PRO-LEVEL: Sirf GET requests allow hongi
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // 🛡️ PRO-LEVEL: Session verify karna taaki bina login koi data na nikal sake
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized Access' });
  }

  try {
    // Database se connect karein
    await dbConnect();
    
    // User ki email ke hisaab se uski aakhiri 20 scans nikalna (Latest pehle)
    const history = await ScanHistory.find({ userEmail: session.user.email })
                                     .sort({ createdAt: -1 })
                                     .limit(20);
                                     
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
}