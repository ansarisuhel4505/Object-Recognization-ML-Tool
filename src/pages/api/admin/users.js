import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  // 🛡️ SUPER-SECURE: Check if user is logged in AND is an admin
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ success: false, error: 'Unauthorized. Admins Only.' });
  }

  await dbConnect();

  // 1. GET: Fetch all users
  if (req.method === 'GET') {
    try {
      const users = await User.find({}).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Database error' });
    }
  } 
  
  // 2. POST: Create a new user manually
  else if (req.method === 'POST') {
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await User.create({ 
        name, 
        email, 
        password: hashedPassword, 
        role: 'user', 
        status: 'active' 
      });
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Email already exists or invalid data.' });
    }
  } 
  
  // 3. PUT: Update user status (Block / Unblock)
  else if (req.method === 'PUT') {
    try {
      const { id, status } = req.body;
      const user = await User.findByIdAndUpdate(id, { status }, { new: true });
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Update failed.' });
    }
  } 
  
  // 4. DELETE: Remove user permanently
  else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await User.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Deletion failed.' });
    }
  } 
  
  else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}