import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
export default async function handler(req, res) {
  await dbConnect();

  // GET: Fetch All Users
  if (req.method === 'GET') {
    try {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to fetch users" });
    }
  }

  // PUT: Block/Unblock User
  if (req.method === 'PUT') {
    try {
      const { userId, status } = req.body;
      const updatedUser = await User.findByIdAndUpdate(userId, { status }, { new: true });
      return res.status(200).json({ success: true, message: `User ${status} successfully`, data: updatedUser });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to update status" });
    }
  }

  // POST: Admin creates a new user manually
  if (req.method === 'POST') {
    try {
      const { name, email, password, role } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ success: false, error: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ name, email, password: hashedPassword, role, status: 'active' });
      
      return res.status(201).json({ success: true, message: "User created successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to create user" });
    }
  }

  res.status(405).end();
}