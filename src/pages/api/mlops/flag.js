import dbConnect from '../../../lib/mongodb';
import FlaggedData from '../../../models/FlaggedData';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  try {
    await dbConnect();
    const { image, predictedLabel, userEmail } = req.body;

    // Yahan ideally Cloudinary me upload karke URL save karte hain, 
    // par abhi base64 ya existing URL direct save kar rahe hain.
    const newFlag = await FlaggedData.create({
      imageUrl: image,
      predictedLabel,
      userEmail,
      status: 'pending_review'
    });

    return res.status(200).json({ success: true, message: 'Data pushed to MLOps pipeline', data: newFlag });
  } catch (error) {
    console.error("MLOps Flag Error:", error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}