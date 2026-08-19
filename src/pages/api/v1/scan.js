import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Cors from 'cors';

// Initialize CORS middleware so external apps can call this API
const cors = Cors({ methods: ['POST', 'GET', 'HEAD'] });

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== 'POST') return res.status(405).json({ error: "Only POST method is allowed." });

  // 1. EXTRACT API KEY FROM HEADERS
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Missing or invalid Authorization header. Format: Bearer sk_live_..." });
  }
  const apiKey = authHeader.split(' ')[1];

  // 2. VERIFY API KEY IN DATABASE
  await dbConnect();
  const user = await User.findOne({ apiKey, status: 'active' });
  if (!user) {
    return res.status(401).json({ error: "Invalid API Key or Account Suspended." });
  }

  // 3. GET IMAGE DATA FROM REQUEST
  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "Missing 'imageBase64' field in request body." });
  }

  try {
    // 4. FORWARD REQUEST TO RENDER PYTHON BACKEND
    // (Tere Render API ka URL yaha daal ya .env se utha le)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://object-recognization-ml-tool.onrender.com';
    
    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image: imageBase64, 
        email: user.email, // Passing user email to backend for tracking
        modelVersion: 'v1.0' 
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Neural Engine processing failed.");
    }

    // 5. RETURN SUCCESSFUL RESULT TO DEVELOPER
    return res.status(200).json({
      success: true,
      developer: user.name,
      prediction: data.prediction,
      confidence: data.confidence,
      bounding_boxes: data.boxes,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error or AI Engine is offline." });
  }
}