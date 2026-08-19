import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import ScanHistory from '../../../models/ScanHistory';

export default async function handler(req, res) {
  // CORS setup so other apps can call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    // 1. Verify API Key from Headers (Bearer Token)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: 'Missing or invalid API Key in Authorization header' });
    }

    const apiKey = authHeader.split(" ")[1];
    
    await dbConnect();
    const user = await User.findOne({ apiKey, status: 'active' });
    if (!user) {
      return res.status(403).json({ error: 'Invalid API Key or Account Blocked' });
    }

    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 field is required' });

    // 2. Forward request to your Python ML Engine (running on the same Vercel app)
    // Note: Vercel par iska exact URL chahiye hoga, local par localhost
    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    const mlResponse = await fetch(`${protocol}://${host}/api/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64, email: user.email })
    });

    const mlData = await mlResponse.json();

    // 3. Return Professional API Response to Developer
    return res.status(200).json({
      success: true,
      data: {
        prediction: mlData.prediction,
        confidence: 0.98, // Dummy logic, can be replaced with real model accuracy
        developerId: user._id,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}