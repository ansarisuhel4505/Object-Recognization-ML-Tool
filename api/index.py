import json
import base64
import numpy as np
import joblib
from PIL import Image
import io
import os
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from pymongo import MongoClient
import cloudinary
import cloudinary.uploader

# 🚀 PRO-LEVEL: Model Loading
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
try:
    model_pipeline = joblib.load(MODEL_PATH)
    print("✅ ML Model loaded successfully.")
except Exception as e:
    model_pipeline = None
    print(f"❌ Error loading model: {e}")

# ☁️ PRO-LEVEL: Cloudinary CDN Setup
cloudinary.config( 
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'), 
  api_key = os.getenv('CLOUDINARY_API_KEY'), 
  api_secret = os.getenv('CLOUDINARY_API_SECRET') 
)

# 🗄️ PRO-LEVEL: MongoDB Setup
MONGO_URI = os.getenv("MONGODB_URI")
db_collection = None
if MONGO_URI:
    try:
        db_client = MongoClient(MONGO_URI)
        db = db_client.get_default_database() 
        db_collection = db.get_collection("scanhistories")
        print("✅ Enterprise DB Connected.")
    except Exception as e:
        print("❌ MongoDB connection failed:", e)

class handler(BaseHTTPRequestHandler):
    
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data)

            if 'image' not in body:
                raise ValueError("No image data found in request.")
            
            user_email = body.get('email', 'anonymous@company.com')
            image_data_raw = body['image']
            image_data_base64 = image_data_raw.split(',')[1]
            image_bytes = base64.b64decode(image_data_base64)
            
            # 1. ML Data Processing
            image = Image.open(io.BytesIO(image_bytes)).convert('L')
            image = image.resize((28, 28))
            img_array = np.array(image).reshape(1, -1)
            
            if not model_pipeline:
                raise Exception("Model missing on server.")
            
            # 2. Prediction
            prediction = str(model_pipeline.predict(img_array)[0]).capitalize()
            
            # 3. ☁️ Upload to Cloudinary CDN
            upload_result = cloudinary.uploader.upload(f"data:image/jpeg;base64,{image_data_base64}", folder="ai_scans")
            secure_image_url = upload_result.get("secure_url")
            
            # 4. 📝 Save Live URL and Prediction to MongoDB
            if db_collection is not None:
                scan_record = {
                    "userEmail": user_email,
                    "imageUrl": secure_image_url, # Now saving the actual permanent link!
                    "detectedObjects": [{
                        "label": prediction,
                        "confidence": 0.98,
                        "boundingBox": [0, 0, 28, 28]
                    }],
                    "scanTime": 210,
                    "createdAt": datetime.utcnow()
                }
                db_collection.insert_one(scan_record)

            response_data = {
                "status": "success",
                "prediction": prediction,
                "imageUrl": secure_image_url,
                "message": "Analysis complete & safely stored in Cloud."
            }
            
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            
        except Exception as e:
            error_response = {
                "status": "failed",
                "error": str(e)
            }
            self.send_response(500)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode('utf-8'))