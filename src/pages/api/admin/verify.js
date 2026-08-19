export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { password } = req.body;
  
  // Checking against the environment variable
  if (password === process.env.ADMIN_SECRET_KEY) {
    return res.status(200).json({ success: true, message: "Access Granted" });
  }
  
  return res.status(401).json({ success: false, error: "ACCESS DENIED: Unauthorized Personnel" });
}