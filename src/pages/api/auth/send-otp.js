import dbConnect from '../../../../lib/mongodb';
import Otp from '../../../../models/Otp';
import User from '../../../../models/User';
import nodemailer from 'nodemailer';

// 🚀 STRICT ALLOWLIST: Sirf inhi domains par OTP jayega
const ALLOWED_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();
  
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // 1. STRICT EMAIL DETECTION (Block all temp mails)
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
    return res.status(403).json({ error: "Only official email providers (Gmail, Outlook, Yahoo) are allowed." });
  }

  // 2. CHECK IF ADMIN BLOCKED THIS USER
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.status === 'blocked') {
      return res.status(403).json({ error: "Your account has been suspended. Contact Administrator." });
    }
    return res.status(400).json({ error: "Email is already registered. Please login." });
  }

  // 3. RATE LIMITING (Max 3 OTPs per hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const otpAttempts = await Otp.countDocuments({ email, createdAt: { $gte: oneHourAgo } });
  
  if (otpAttempts >= 3) {
    return res.status(429).json({ error: "Maximum limit reached. You are blocked for 1 hour due to security reasons." });
  }

  // 4. GENERATE & SAVE OTP
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.create({ email, otp: generatedOtp });

  // 5. SEND EMAIL
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  const mailOptions = {
    from: `"Vision AI Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Secure Verification Code",
    html: `
      <div style="font-family: Arial; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 8px;">
        <h2 style="color: #3b82f6;">Vision AI Registration</h2>
        <p>Your secure OTP is:</p>
        <h1 style="background: #111; padding: 15px; text-align: center; letter-spacing: 8px; color: #10b981;">${generatedOtp}</h1>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent to your official email." });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email." });
  }
}