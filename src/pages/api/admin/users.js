import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  await dbConnect();

  // GET: Fetch all users
  if (req.method === 'GET') {
    try {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Database Error" });
    }
  }

  // PUT: Block / Unblock User
  if (req.method === 'PUT') {
    try {
      const { userId, status } = req.body;
      await User.findByIdAndUpdate(userId, { status });
      return res.status(200).json({ success: true, message: `User ${status} successfully.` });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to update status." });
    }
  }

  // POST: Create User Manually
  if (req.method === 'POST') {
    try {
      const { name, email, password, role } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ success: false, error: "Email already registered." });

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ name, email, password: hashedPassword, role, status: 'active' });
      return res.status(201).json({ success: true, message: "User provisioned successfully." });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to create user." });
    }
  }

  // DELETE: Remove User
  if (req.method === 'DELETE') {
    try {
      const { userId } = req.body;
      await User.findByIdAndDelete(userId);
      return res.status(200).json({ success: true, message: "User deleted permanently." });
    } catch (error) {
      return res.status(500).json({ success: false, error: "Failed to delete user." });
    }
  }

  res.status(405).end();
}