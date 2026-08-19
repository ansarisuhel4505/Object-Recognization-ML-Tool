import dbConnect from '../../../../lib/mongodb';
import Otp from '../../../../models/Otp';
import User from '../../../../models/User';
import nodemailer from 'nodemailer';

// Fake Email Domains List (Temp mails)
const BLOCKED_DOMAINS = ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'yopmail.com', 'throwawaymail.com'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();
  
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  // 1. Fake Email Detection
  const domain = email.split('@')[1];
  if (BLOCKED_DOMAINS.includes(domain.toLowerCase())) {
    return res.status(403).json({ error: "Temporary or disposable emails are strictly prohibited." });
  }

  // 2. Already Registered Check
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: "Email is already registered. Please login." });

  // 3. Rate Limiting: Max 3 OTPs per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const otpAttempts = await Otp.countDocuments({ email, createdAt: { $gte: oneHourAgo } });
  
  if (otpAttempts >= 3) {
    return res.status(429).json({ error: "Maximum limit reached. You are blocked for 1 hour due to security reasons." });
  }

  // 4. Generate & Save OTP
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  await Otp.create({ email, otp: generatedOtp });

  // 5. Send Email via Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  const mailOptions = {
    from: `"Vision AI Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Vision AI Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0f172a; color: #fff; border-radius: 10px;">
        <h2 style="color: #38bdf8;">Vision AI Enterprise</h2>
        <p>Your secure One-Time Password (OTP) for account registration is:</p>
        <h1 style="background: #1e293b; padding: 10px; text-align: center; letter-spacing: 5px; color: #10b981; border-radius: 5px;">${generatedOtp}</h1>
        <p style="color: #94a3b8; font-size: 12px;">This code is valid for 10 minutes. Do not share it with anyone.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent successfully to your email." });
  } catch (error) {
    res.status(500).json({ error: "Failed to send email. Check SMTP settings." });
  }
}