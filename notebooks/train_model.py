import numpy as np
import pandas as pd
import time
import joblib
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

def build_and_train_model():
    print("🚀 Starting Enterprise ML Training Pipeline...")
    start_time = time.time()

    # Step 1: Data Import (Fetching CIFAR-10 / MNIST subset for object recognition)
    print("\n📦 Downloading Dataset (This might take a minute)...")
    # Hum yahan MNIST le rahe hain as an example taaki aapke laptop par jaldi train ho. 
    # Real company project me aap 'CIFAR_10_small' ya custom dataset load karenge.
    X, y = fetch_openml('mnist_784', version=1, return_X_y=True, as_frame=False)
    
    # Dataset bahut bada hota hai, training fast karne ke liye hum 15,000 images ka subset lenge
    X_subset, y_subset = X[:15000], y[:15000]

    # Step 2: Data Splitting (80% Training, 20% Testing)
    print("✂️ Splitting data into Training and Testing sets...")
    X_train, X_test, y_train, y_test = train_test_split(X_subset, y_subset, test_size=0.2, random_state=42)

    # Step 3: Enterprise Pipeline Creation
    # Ye ekdum pro-level approach hai jisme 3 steps ek sath chain ho jate hain
    print("⚙️ Building Sklearn Pipeline (Scaler -> PCA -> SVM)...")
    pipeline = Pipeline([
        ('scaler', StandardScaler()), # Data ko normalize karta hai
        ('pca', PCA(n_components=0.90)), # 90% important features rakhega, size compress karega
        ('svm', SVC(kernel='rbf', C=5.0, gamma='scale', probability=False)) # Core Algorithm
    ])

    # Step 4: Model Training
    print("🧠 Training the Support Vector Machine (SVM) Model. Please wait...")
    pipeline.fit(X_train, y_train)

    # Step 5: Prediction & Score Check
    print("📊 Evaluating Model Performance...")
    predictions = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    
    print(f"\n✅ Model Accuracy: {accuracy * 100:.2f}%")
    print("\n📋 Classification Report:\n")
    print(classification_report(y_test, predictions))

    # Step 6: Export Model for Deployment
    # Model ko directly Vercel ke API folder me bhej rahe hain
    export_path = '../api/model.pkl'
    print(f"💾 Saving compressed model to {export_path}...")
    joblib.dump(pipeline, export_path)
    
    end_time = time.time()
    print(f"🎉 Pipeline execution completed successfully in {(end_time - start_time):.2f} seconds!")

if __name__ == "__main__":
    build_and_train_model()