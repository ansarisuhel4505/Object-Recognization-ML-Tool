from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import time
import math

# Initialize Mega FastAPI App
app = FastAPI(title="Vision AI Enterprise Mega Engine", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚀 LOAD AI MODEL
print("Loading Neural Network Weights...")
model = YOLO('yolov8n.pt') 
print("Mega System Ready.")

# 🚀 SPEED TRACKING MEMORY DICTIONARY
tracking_memory = {}

class ImagePayload(BaseModel):
    image: str
    email: str = "guest"
    modelVersion: str = "v1.0"
    isRealTime: bool = False

def base64_to_image(base64_str):
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]
    image_bytes = base64.b64decode(base64_str)
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

def create_heatmap(image_cv, boxes):
    blank = np.zeros(image_cv.shape[:2], dtype=np.uint8)
    for b in boxes:
        x_center = int((b['box'][0] + (b['box'][2]/2)) * image_cv.shape[1] / 100)
        y_center = int((b['box'][1] + (b['box'][3]/2)) * image_cv.shape[0] / 100)
        cv2.circle(blank, (x_center, y_center), 100, 255, -1)
    
    heatmap_blur = cv2.GaussianBlur(blank, (101, 101), 0)
    heatmap_color = cv2.applyColorMap(heatmap_blur, cv2.COLORMAP_JET)
    _, buffer = cv2.imencode('.jpg', heatmap_color)
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')

@app.post("/api/analyze")
async def analyze_image(payload: ImagePayload):
    try:
        current_time = time.time()
        img_cv = base64_to_image(payload.image)
        img_height, img_width = img_cv.shape[:2]

        # 🚀 1. RUN YOLOv8
        results = model.predict(source=img_cv, conf=0.4, save=False)
        
        detected_boxes = []
        primary_label = "No Object Detected"
        highest_conf = 0.0

        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                label = model.names[cls_id]

                if conf > highest_conf:
                    highest_conf = conf
                    primary_label = label

                # 🚀 2. ACTIVE LEARNING (Smart Data Engine)
                if conf < 0.60:
                    print(f"⚠️ [ACTIVE LEARNING TRIGGERED]: {label} ({int(conf*100)}%). Send to DB.")

                speed_text = "Tracking..."
                
                # Use email in Tracking Key to prevent Multiple User Clashes
                user_id = payload.email if payload.email else "guest"

                # 🚦 TRAFFIC CAMERA CONFIGURATION
                LINE_A_Y = 30 
                LINE_B_Y = 70 
                REAL_DISTANCE_METERS = 10.0 

                # 🚀 3. TRAFFIC SPEED ESTIMATION LOGIC
                if payload.isRealTime:
                    obj_key = f"{user_id}_{label}_{cls_id}" 
                    y_center_pct = (y1 + y2) / 2 / img_height * 100
                    
                    if obj_key not in tracking_memory:
                        tracking_memory[obj_key] = {'time_A': 0, 'time_B': 0, 'speed': None, 'prev_y': y_center_pct}
                    else:
                        memory = tracking_memory[obj_key]
                        
                        # Line A cross hone par
                        if memory['prev_y'] <= LINE_A_Y and y_center_pct > LINE_A_Y:
                            memory['time_A'] = current_time
                            
                        # Line B cross hone par
                        elif memory['prev_y'] <= LINE_B_Y and y_center_pct > LINE_B_Y:
                            if memory['time_A'] > 0:
                                time_taken = current_time - memory['time_A']
                                if time_taken > 0:
                                    speed_m_s = REAL_DISTANCE_METERS / time_taken
                                    speed_km_h = speed_m_s * 3.6
                                    memory['speed'] = speed_km_h
                                    print(f"🚓 TRAFFIC ALERT: [{label}] Speed = {speed_km_h:.1f} km/h")
                        
                        memory['prev_y'] = y_center_pct
                        
                        if memory['speed']:
                            speed_text = f"Speed: {memory['speed']:.1f} km/h"
                        elif memory['time_A'] > 0:
                            speed_text = "Calculating..."

                x_pct = (x1 / img_width) * 100
                y_pct = (y1 / img_height) * 100
                w_pct = ((x2 - x1) / img_width) * 100
                h_pct = ((y2 - y1) / img_height) * 100

                display_label = f"{label} ({int(conf*100)}%) | {speed_text}" if payload.isRealTime else f"{label} ({int(conf*100)}%)"

                detected_boxes.append({
                    "label": display_label,
                    "box": [x_pct, y_pct, w_pct, h_pct]
                })

        # 🚀 4. EXPLAINABLE AI HEATMAP
        heatmap_base64 = None
        if len(detected_boxes) > 0:
            heatmap_base64 = create_heatmap(img_cv, detected_boxes)

        return {
            "success": True,
            "prediction": primary_label.capitalize(),
            "confidence": highest_conf,
            "boxes": detected_boxes,
            "heatmap": heatmap_base64,
            "version": payload.modelVersion
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Mega Neural Network Failed")