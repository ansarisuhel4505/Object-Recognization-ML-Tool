import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Otp from '../../../../models/Otp';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  await dbConnect();

  const { name, email, password, otp } = req.body;

  // Verify OTP
  const validOtp = await Otp.findOne({ email, otp }).sort({ createdAt: -1 });
  if (!validOtp) return res.status(400).json({ error: "Invalid or Expired OTP." });

  // Delete OTP after successful use
  await Otp.deleteMany({ email });

  // Create User
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user',
    status: 'active'
  });

  res.status(201).json({ success: true, message: "Account created successfully! You can now login." });
}