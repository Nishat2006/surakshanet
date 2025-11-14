"""
SurakshaNet Backend Application
"""

import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow startup logs

import time
import uuid
import hashlib
import json
import asyncio
import psutil
import platform
import numpy as np
import pandas as pd
import joblib
import requests
import shap
import xgboost
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from tensorflow.keras.models import load_model
from tensorflow.keras.losses import MeanSquaredError

# --- CHANGED: Removed 'App', we will use string literals for robustness ---
from composio import ComposioToolSet

from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import create_engine, Column, String, Text, DateTime, Float, Integer
from sqlalchemy.orm import sessionmaker, declarative_base

# =============================================================================
# CONFIGURATION
# =============================================================================

# Database Configuration
DATABASE_URL = "postgresql+pg8000://surakshanet:surakshanet123@localhost:5432/surakshanet_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Blockchain Configuration
BLOCKCHAIN_URL = "http://localhost:3001"

# Composio API Configuration
COMPOSIO_API_KEY = "ak_bMIDkCtvAN6qqQdpQClk" 
SLACK_CHANNEL_ID = "#surakshanet-alerts"

# Initialize the ToolSet
toolset = ComposioToolSet(api_key=COMPOSIO_API_KEY)

# AI Models Configuration
MODELS_DIR = 'models'
EXPECTED_FEATURES = [
    'Destination Port', 'Flow Duration', 'Total Fwd Packets', 'Total Length of Fwd Packets',
    'Fwd Packet Length Max', 'Fwd Packet Length Min', 'Fwd Packet Length Mean', 'Fwd Packet Length Std',
    'Bwd Packet Length Max', 'Bwd Packet Length Min', 'Bwd Packet Length Mean', 'Bwd Packet Length Std',
    'Flow Bytes/s', 'Flow Packets/s', 'Flow IAT Mean', 'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min',
    'Fwd IAT Total', 'Fwd IAT Mean', 'Fwd IAT Std', 'Fwd IAT Max', 'Fwd IAT Min', 'Bwd IAT Total',
    'Bwd IAT Mean', 'Bwd IAT Std', 'Bwd IAT Max', 'Bwd IAT Min', 'Fwd Header Length', 'Bwd Header Length',
    'Fwd Packets/s', 'Bwd Packets/s', 'Min Packet Length', 'Max Packet Length', 'Packet Length Mean',
    'Packet Length Std', 'Packet Length Variance', 'FIN Flag Count', 'PSH Flag Count', 'ACK Flag Count',
    'Average Packet Size', 'Subflow Fwd Bytes', 'Init_Win_bytes_forward', 'Init_Win_bytes_backward',
    'act_data_pkt_fwd', 'min_seg_size_forward', 'Active Mean', 'Active Max', 'Active Min',
    'Idle Mean', 'Idle Max', 'Idle Min'
]

# =============================================================================
# DATABASE MODEL
# =============================================================================

class Log(Base):
    """SQLAlchemy model for logs table"""
    __tablename__ = "logs"
    
    log_id = Column(String, primary_key=True)
    timestamp_iso = Column(DateTime(timezone=True))
    display_timestamp = Column(String)
    source_ip = Column(String, index=True)
    attack_type = Column(String, index=True)
    features = Column(Text)
    severity = Column(String, index=True)
    user = Column(String)
    source_system = Column(String)
    target_ip = Column(String)
    message = Column(Text)
    ai_if_score = Column(Float)
    status = Column(String, default='Active')
    log_count = Column(Integer)

# Create tables
Base.metadata.create_all(bind=engine)

# =============================================================================
# FLASK APP INITIALIZATION
# =============================================================================

app = Flask(__name__)
CORS(app)

# =============================================================================
# AI MODEL LOADING - TRINITY PIPELINE
# =============================================================================

print("Loading Trinity AI models from ./models/ folder...")

scaler = None
isolation_forest_model = None
autoencoder_model = None
xgboost_classifier = None
explainer = None

# Load Scaler
try:
    scaler = joblib.load(os.path.join(MODELS_DIR, 'scaler.pkl'))
    print("✅ Scaler loaded successfully.")
except Exception as e:
    print(f"⚠️  Could not load scaler: {e}")

# Load Isolation Forest Model
try:
    isolation_forest_model = joblib.load(os.path.join(MODELS_DIR, 'anomaly_model.pkl'))
    print("✅ Isolation Forest model loaded successfully.")
    
    # Initialize SHAP explainer for IsolationForest
    try:
        print("Initializing SHAP explainer...")
        explainer = shap.TreeExplainer(isolation_forest_model)
        print("✅ SHAP explainer initialized.")
    except Exception as shap_error:
        print(f"⚠️  Could not initialize SHAP explainer: {shap_error}")
except Exception as e:
    print(f"⚠️  Could not load Isolation Forest model: {e}")

# Load Autoencoder Model
try:
    autoencoder_model = load_model(
        os.path.join(MODELS_DIR, 'autoencoder_model.h5'),
        custom_objects={'mse': MeanSquaredError()}
    )
    print("✅ Autoencoder model loaded successfully.")
except Exception as e:
    print(f"⚠️  Could not load Autoencoder model: {e}")

# Load XGBoost Classifier
try:
    xgboost_classifier = joblib.load(os.path.join(MODELS_DIR, 'classifier_model.pkl'))
    print("✅ XGBoost classifier loaded successfully.")
except Exception as e:
    print(f"⚠️  Could not load XGBoost classifier: {e}")

if not scaler or not isolation_forest_model or not autoencoder_model or not xgboost_classifier:
    print("⚠️  Some models are missing. Running in partial/demo mode.")

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def calculate_reconstruction_error(model, data):
    """Calculate reconstruction error (MSE) for Autoencoder model"""
    try:
        reconstructed = model.predict(data, verbose=0)
        mse = np.mean(np.square(data - reconstructed))
        return float(mse)
    except Exception as e:
        print(f"Error calculating reconstruction error: {e}")
        return 0.0


def run_inference_pipeline(features_csv_string):
    """
    Trinity AI Pipeline: Runs inference using three models with voting logic.
    Returns: (severity, final_label, if_score, ae_error)
    """
    # Check if all models are loaded
    if not scaler or not isolation_forest_model or not autoencoder_model or not xgboost_classifier:
        # Demo mode - return mock values
        return "MEDIUM", "Demo Mode - Models Not Loaded", -0.3, 0.03
    
    try:
        # Parse and validate features
        features_list = [float(f.strip()) for f in features_csv_string.split(',')]
        if len(features_list) != len(EXPECTED_FEATURES):
            raise ValueError(f"Feature count mismatch: expected {len(EXPECTED_FEATURES)}, got {len(features_list)}")
        
        # Create DataFrame and scale data
        input_df = pd.DataFrame([features_list], columns=EXPECTED_FEATURES)
        scaled_data = scaler.transform(input_df)
        
        # Initialize voting counters
        anomaly_votes = 0
        
        # MODEL 1: Isolation Forest
        if_score = isolation_forest_model.score_samples(scaled_data)[0]
        if_vote = if_score < -0.5  # Threshold for anomaly
        if if_vote:
            anomaly_votes += 1
        
        # MODEL 2: Autoencoder
        ae_error = calculate_reconstruction_error(autoencoder_model, scaled_data)
        ae_vote = ae_error > 0.05  # Threshold for anomaly
        if ae_vote:
            anomaly_votes += 1
        
        # MODEL 3: XGBoost Classifier
        xgb_prediction = xgboost_classifier.predict(scaled_data)[0]
        xgb_vote = xgb_prediction == 1  # 1 = Attack, 0 = Normal
        if xgb_vote:
            anomaly_votes += 1
        
        # VOTING LOGIC
        if anomaly_votes >= 2:
            # 2 or more votes: Confirmed Intrusion
            severity = "CRITICAL"
            final_label = "Confirmed Intrusion"
        elif anomaly_votes == 1:
            # 1 vote: Suspected Anomaly
            severity = "MEDIUM" if ae_vote else "HIGH"
            final_label = "Suspected Anomaly"
        else:
            # 0 votes: Normal Traffic
            severity = "LOW"
            final_label = "Normal Traffic"
        
        print(f"Trinity AI Results: IF={if_vote}, AE={ae_vote}, XGB={xgb_vote} | Votes={anomaly_votes} | Label={final_label}")
        
        return severity, final_label, float(if_score), float(ae_error)
    
    except Exception as e:
        print(f"ERROR during Trinity inference: {e}")
        import traceback
        traceback.print_exc()
        return "MEDIUM", "Inference Error", 0.0, 0.0


def format_display_timestamp(dt_object):
    """Format datetime object to display format"""
    try:
        # Convert to local timezone if needed
        if dt_object.tzinfo is None:
            dt_object = dt_object.replace(tzinfo=timezone.utc)
        local_dt = dt_object.astimezone()
        return local_dt.strftime("%m/%d/%Y, %I:%M:%S %p")
    except Exception as e:
        return str(dt_object)


def log_to_blockchain(log_item):
    """Send log to Node.js blockchain"""
    try:
        timestamp_str = log_item.get('timestamp_iso')
        if isinstance(timestamp_str, datetime):
            timestamp_str = timestamp_str.isoformat()

        payload = {
            'log_id': log_item.get('log_id'),
            'severity': log_item.get('severity'),
            'source_ip': log_item.get('source_ip'),
            'attack_type': log_item.get('attack_type'),
            'message': log_item.get('message'),
            'timestamp': timestamp_str,
            'log_count': log_item.get('log_count')
        }

        # Check for missing critical data
        if not payload['log_id'] or not payload['severity']:
            print(f"❌ Blockchain logging error: Missing log_id or severity in payload.")
            return

        response = requests.post(f"{BLOCKCHAIN_URL}/log", json=payload, timeout=5)

        if response.status_code == 200:
            print(f"✅ Log sent to blockchain demo server.")
        else:
            print(f"❌ Blockchain demo server error: {response.text}")

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to blockchain demo server (is it running?).")
    except Exception as e:
        print(f"❌ An unexpected error occurred in log_to_blockchain: {e}")
        import traceback
        traceback.print_exc()
        

def send_slack_alert(log_item):
    """Send alert to Slack via Composio SDK"""
    try:
        # Extract log details
        severity = log_item.get('severity', 'UNKNOWN')
        attack_type = log_item.get('attack_type', 'Unknown Event')
        source_ip = log_item.get('source_ip', 'N/A')
        log_id = log_item.get('log_id', 'N/A')
        timestamp = log_item.get('timestamp_iso', datetime.now(timezone.utc))
        
        if isinstance(timestamp, datetime):
            timestamp_str = timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        else:
            timestamp_str = str(timestamp)
        
        # Construct message
        message = f"""🚨 *{severity} ALERT DETECTED* 🚨

*Attack Type:* {attack_type}
*Source IP:* {source_ip}
*Log ID:* {log_id}
*Timestamp:* {timestamp_str}
*Message:* {log_item.get('message', 'No additional details')}

⚠️ Immediate action required!"""
        
        print("\n🔔 Sending Slack alert via Composio SDK...")
        
        # Execute Action using SDK - STRING LITERAL FIX
        response = toolset.execute_action(
            action="SLACK_CHAT_POST_MESSAGE",
            params={
                "channel": SLACK_CHANNEL_ID,
                "text": message
            }
        )
        print(f"✅ Slack alert sent successfully! Response: {response}")
        return True
        
    except Exception as e:
        print(f"❌ Error in send_slack_alert: {e}")
        return False


def send_gmail_alert(log_item):
    """Send alert email via Gmail using Composio SDK"""
    try:
        # Extract log details
        severity = log_item.get('severity', 'UNKNOWN')
        attack_type = log_item.get('attack_type', 'Unknown Event')
        source_ip = log_item.get('source_ip', 'N/A')
        log_id = log_item.get('log_id', 'N/A')
        timestamp = log_item.get('timestamp_iso', datetime.now(timezone.utc))
        
        if isinstance(timestamp, datetime):
            timestamp_str = timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        else:
            timestamp_str = str(timestamp)
        
        subject = f"🚨 {severity} ALERT: {attack_type} Detected - SurakshaNet"
        
        body = f"""CRITICAL SECURITY ALERT

A {severity} severity threat has been detected by SurakshaNet.

ALERT DETAILS:
--------------
Severity: {severity}
Attack Type: {attack_type}
Source IP: {source_ip}
Log ID: {log_id}
Timestamp: {timestamp_str}

DESCRIPTION:
{log_item.get('message', 'No additional details available')}

RECOMMENDED ACTIONS:
- Investigate the source IP immediately
- Review related logs in the SurakshaNet dashboard

---
SurakshaNet Security Operations"""
        
        print("\n🔔 Sending Gmail alert via Composio SDK...")
        
        # Execute Action using SDK - STRING LITERAL FIX
        response = toolset.execute_action(
            action="GMAIL_SEND_EMAIL",
            params={
                "recipient_email": "parthgochhwal17@gmail.com", 
                "subject": subject,
                "body": body
            }
        )
        print(f"✅ Gmail alert sent successfully! Response: {response}")
        return True
        
    except Exception as e:
        print(f"❌ Error in send_gmail_alert: {e}")
        return False

def respond_to_threat_logic(log_item):
    """Alert logic for high severity threats - sends alerts to Slack and Gmail"""
    print(f"\n--- ALERT: {log_item.get('severity', 'N/A')} Threat Detected ---")
    print(f"Log ID: {log_item.get('log_id', 'N/A')}")
    print(f"Source IP: {log_item.get('source_ip', 'N/A')}")
    print(f"Attack Type: {log_item.get('attack_type', 'N/A')}")
    print(f"Message: {log_item.get('message', 'N/A')}")
    print(f"--- End Alert ---\n")
    
    # Send external alerts
    send_slack_alert(log_item)
    send_gmail_alert(log_item)
    
    print("✅ External alerts dispatched.\n")


def _build_cors_preflight_response():
    """Build CORS preflight response"""
    response = make_response(jsonify({'message': 'CORS preflight successful'}))
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
    response.headers.add('Access-Control-Allow-Methods', "GET,POST,OPTIONS")
    return response


# =============================================================================
# FLASK API ROUTES
# =============================================================================

@app.route('/ingest', methods=['POST', 'OPTIONS'])
def ingest_log_route():
    """Ingest log data and run AI analysis"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        log_data = request.json
        if not log_data or 'features' not in log_data:
            return jsonify({'error': 'Missing JSON body or features field'}), 400
        
        print(f"\n--- Received /ingest request ---")
        
        log_id = str(uuid.uuid4())
        received_timestamp_str = log_data.get('timestamp', time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
        
        # Parse timestamp to datetime object
        try:
            clean_iso = received_timestamp_str.split('.')[0].replace('Z', '')
            timestamp_dt = datetime.strptime(clean_iso, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
        except:
            timestamp_dt = datetime.now(timezone.utc)
        
        display_timestamp = format_display_timestamp(timestamp_dt)
        
        # Run Trinity AI pipeline - returns (severity, final_label, if_score, ae_error)
        severity, final_label, if_score, ae_error = run_inference_pipeline(log_data.get('features', ''))
        
        # Overwrite generic attack type with AI-generated label if needed
        attack_type_from_request = log_data.get('attack_type', 'Unknown Event')
        if attack_type_from_request == 'Unknown Event':
            attack_type = final_label
        else:
            attack_type = attack_type_from_request
        
        # Generate AI analysis message
        ai_message = f"AI Analysis: {final_label} (IF Score: {if_score:.2f}, AE Loss: {ae_error:.4f})"
        
        # Generate random log count (12-76)
        log_count = int(np.random.randint(12, 77))
        
        # Save to database
        db = SessionLocal()
        try:
            new_log = Log(
                log_id=log_id,
                timestamp_iso=timestamp_dt,
                display_timestamp=display_timestamp,
                source_ip=log_data.get('source_ip', 'N/A'),
                attack_type=attack_type,
                features=log_data.get('features', ''),
                severity=severity,
                user=log_data.get('user', 'system'),
                source_system=log_data.get('source_system', 'simulator'),
                target_ip=log_data.get('target_ip', 'N/A'),
                message=ai_message,
                ai_if_score=float(if_score),
                status='Active',
                log_count=log_count
            )
            
            db.add(new_log)
            db.commit()
            print(f"✅ Log saved to database: {log_id}, Severity: {severity}, Log Count: {log_count}")
            
            # Create log_dict using local variables (not new_log attributes)
            log_dict = {
                'log_id': log_id,
                'timestamp_iso': timestamp_dt,
                'severity': severity,
                'source_ip': log_data.get('source_ip', 'N/A'),
                'attack_type': attack_type,
                'message': ai_message,
                'log_count': log_count
            }
            
            # 1. Send to blockchain.js for the demo
            log_to_blockchain(log_dict)
            
            # 2. Call respond_to_threat_logic (if needed)
            if severity in ["MEDIUM", "HIGH", "CRITICAL"]:
                print(f"⚠️  High severity detected: {severity}")
                respond_to_threat_logic(log_dict)
            
            return jsonify({
                'log_id': log_id,
                'message': 'Log ingested successfully',
                'severity': severity,
                'blockchain': True
            }), 200
            
        except Exception as db_error:
            db.rollback()
            print(f"Database error: {db_error}")
            raise
        finally:
            db.close()
    
    except Exception as e:
        print(f"ERROR in /ingest: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/explain', methods=['POST', 'OPTIONS'])
def explain_prediction_route():
    """Explain AI prediction using SHAP values"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        if not data or 'features' not in data:
            return jsonify({'error': 'Missing features field'}), 400
        
        if not scaler or not isolation_forest_model or not explainer:
            return jsonify({'error': 'AI models not loaded'}), 503
        
        print(f"\n--- Received /explain request ---")
        
        # Parse features
        features_csv = data.get('features', '')
        features_list = [float(f.strip()) for f in features_csv.split(',')]
        
        if len(features_list) != len(EXPECTED_FEATURES):
            return jsonify({'error': f'Expected {len(EXPECTED_FEATURES)} features, got {len(features_list)}'}), 400
        
        # Create DataFrame and scale
        input_df = pd.DataFrame([features_list], columns=EXPECTED_FEATURES)
        scaled_data = scaler.transform(input_df)
        
        # Get SHAP values
        shap_values = explainer.shap_values(scaled_data)
        
        # For IsolationForest, shap_values is a 2D array (1 sample x features)
        # We need the values for the single prediction
        if isinstance(shap_values, list):
            shap_values = shap_values[0]
        
        shap_values_flat = shap_values[0] if len(shap_values.shape) > 1 else shap_values
        
        # Create feature importance list
        feature_importance = []
        for i, feature_name in enumerate(EXPECTED_FEATURES):
            feature_importance.append({
                'feature': feature_name,
                'shap_value': float(shap_values_flat[i]),
                'feature_value': float(features_list[i])
            })
        
        # Sort by absolute SHAP value (most important first)
        feature_importance.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        
        print(f"✅ SHAP explanation generated for {len(feature_importance)} features")
        
        return jsonify({
            'feature_importance': feature_importance,
            'base_value': float(explainer.expected_value) if hasattr(explainer, 'expected_value') else 0.0
        }), 200
    
    except Exception as e:
        print(f"ERROR in /explain: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/mitigate', methods=['POST', 'OPTIONS'])
def mitigate_threat_route():
    """Mitigate a threat by marking it as handled"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        if not data or 'log_id' not in data:
            return jsonify({'error': 'Missing log_id field'}), 400
        
        log_id = data.get('log_id')
        print(f"\n--- Received /mitigate request for log_id: {log_id} ---")
        
        db = SessionLocal()
        try:
            # Find the log in database
            log_to_update = db.query(Log).filter(Log.log_id == log_id).first()
            
            if not log_to_update:
                return jsonify({'error': 'Log not found'}), 404
            
            # Update the log status
            log_to_update.status = 'Mitigated'
            log_to_update.message = f"[MITIGATED] {log_to_update.message}"
            db.commit()
            
            # Simulate firewall action
            source_ip = log_to_update.source_ip or 'Unknown'
            print(f"🛡️  TAKING ACTION: Blocking IP {source_ip}")
            print(f"✅ Threat {log_id} marked as Mitigated")
            
            return jsonify({
                'success': True,
                'message': f'Threat mitigated successfully. IP {source_ip} blocked.',
                'log_id': log_id
            }), 200
            
        finally:
            db.close()
    
    except Exception as e:
        print(f"ERROR in /mitigate: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/dashboard', methods=['GET', 'OPTIONS'])
def get_dashboard_data_route():
    """Get dashboard data including alerts, logs, and blockchain info"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        print("\n--- Received /dashboard request ---")
        
        db = SessionLocal()
        try:
            # Query 1: Get 8 most recent logs for alerts
            recent_logs_for_alerts = db.query(Log).order_by(Log.timestamp_iso.desc()).limit(8).all()
            
            # Query 2: Get 20 most recent logs for all_logs
            recent_logs_for_all = db.query(Log).order_by(Log.timestamp_iso.desc()).limit(20).all()
            
            # Query 3: Get stats
            total_logs = db.query(Log).count()
            total_threats = db.query(Log).filter(Log.severity.in_(['HIGH', 'CRITICAL'])).count()
            active_alerts = db.query(Log).filter(Log.severity != 'LOW').count()
            
            # Format alerts
            alerts = []
            for item in recent_logs_for_alerts:
                severity = (item.severity or 'LOW').upper()
                color = '#00ff88'
                if severity == 'CRITICAL': color = '#ff4444'
                elif severity == 'HIGH': color = '#ff6600'
                elif severity == 'MEDIUM': color = '#ffaa00'
                
                alerts.append({
                    'id': item.log_id,
                    'title': item.attack_type or 'Log Event',
                    'severity': severity,
                    'sourceIp': item.source_ip or 'N/A',
                    'targetIp': item.target_ip or 'N/A',
                    'timestamp': item.display_timestamp,
                    'description': item.message or 'No details available.',
                    'recommendedActions': [
                        'Isolate affected system.',
                        'Analyze traffic logs.',
                        'Check user credentials.',
                        'Update security rules.'
                    ],
                    'affectedSystem': item.source_system or 'Unknown',
                    'color': color,
                    'status': item.status or 'Active'
                })
            
            # Format all logs
            all_logs_formatted = []
            for item in recent_logs_for_all:
                all_logs_formatted.append({
                    'id': item.log_id,
                    'timestamp': item.display_timestamp,
                    'type': (item.attack_type or 'SYSTEM').upper(),
                    'source': item.source_system or 'Unknown',
                    'user': item.user or 'N/A',
                    'ipAddress': item.source_ip or 'N/A',
                    'severity': (item.severity or 'LOW').upper(),
                    'message': item.message,
                    'rawData': {
                        'log_id': item.log_id,
                        'timestamp_iso': item.timestamp_iso.isoformat() if item.timestamp_iso else None,
                        'severity': item.severity,
                        'source_ip': item.source_ip,
                        'attack_type': item.attack_type,
                        'status': item.status,
                        'features': item.features
                    }
                })
            
            # Calculate stats
            stats = {
                'cpuUsage': 35,
                'memoryUsage': 53,
                'logIngestionRate': "12,577/s",
                'totalThreats': total_threats,
                'anomalies': total_logs,
                'activeAlerts': active_alerts,
            }
            
            dashboard_data = {
                'alerts': alerts,
                'all_logs': all_logs_formatted,
                'stats': stats,
            }
            
            print(f"✅ Sending dashboard data: {len(alerts)} alerts, {len(all_logs_formatted)} logs")
            return jsonify(dashboard_data), 200
            
        finally:
            db.close()
    
    except Exception as e:
        print(f"ERROR in /dashboard: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# =============================================================================
# FASTAPI SYSTEM STATS SERVICE
# =============================================================================

fastapi_app = FastAPI(title="SurakshaNet System Stats Service")

# CORS configuration for FastAPI
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    """Manages WebSocket connections"""
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"❌ Client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Send message to all connected clients"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to client: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)


manager = ConnectionManager()


def get_system_stats():
    """Collect real-time system statistics"""
    try:
        # CPU Stats
        cpu_percent = psutil.cpu_percent(interval=0.1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        
        # Memory Stats
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        # Disk Stats
        disk = psutil.disk_usage('/')
        
        # Network Stats
        net_io = psutil.net_io_counters()
        
        # Process Stats
        process_count = len(psutil.pids())
        
        # System Info
        boot_time = datetime.fromtimestamp(psutil.boot_time())
        uptime = datetime.now() - boot_time
        
        stats = {
            "timestamp": datetime.now().isoformat(),
            "cpu": {
                "usage_percent": round(cpu_percent, 1),
                "count": cpu_count,
                "frequency_mhz": round(cpu_freq.current, 0) if cpu_freq else 0,
                "per_cpu": psutil.cpu_percent(interval=0.1, percpu=True)
            },
            "memory": {
                "total_gb": round(memory.total / (1024**3), 2),
                "available_gb": round(memory.available / (1024**3), 2),
                "used_gb": round(memory.used / (1024**3), 2),
                "usage_percent": round(memory.percent, 1),
                "swap_total_gb": round(swap.total / (1024**3), 2),
                "swap_used_gb": round(swap.used / (1024**3), 2),
                "swap_percent": round(swap.percent, 1)
            },
            "disk": {
                "total_gb": round(disk.total / (1024**3), 2),
                "used_gb": round(disk.used / (1024**3), 2),
                "free_gb": round(disk.free / (1024**3), 2),
                "usage_percent": round(disk.percent, 1)
            },
            "network": {
                "bytes_sent_mb": round(net_io.bytes_sent / (1024**2), 2),
                "bytes_recv_mb": round(net_io.bytes_recv / (1024**2), 2),
                "packets_sent": net_io.packets_sent,
                "packets_recv": net_io.packets_recv,
                "errors_in": net_io.errin,
                "errors_out": net_io.errout
            },
            "system": {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "processor": platform.processor(),
                "process_count": process_count,
                "boot_time": boot_time.isoformat(),
                "uptime_hours": round(uptime.total_seconds() / 3600, 1)
            }
        }
        
        return stats
    
    except Exception as e:
        print(f"Error collecting stats: {e}")
        return {
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


@fastapi_app.get("/")
async def fastapi_root():
    """Health check endpoint"""
    return {
        "service": "SurakshaNet System Stats Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "websocket": "/ws/stats",
            "http": "/stats"
        }
    }


@fastapi_app.get("/stats")
async def get_stats():
    """HTTP endpoint for one-time stats retrieval"""
    return get_system_stats()


@fastapi_app.websocket("/ws/stats")
async def websocket_stats(websocket: WebSocket):
    """WebSocket endpoint for real-time stats streaming"""
    await manager.connect(websocket)
    
    try:
        while True:
            # Collect and send stats every second
            stats = get_system_stats()
            await websocket.send_json(stats)
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected normally")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)


# =============================================================================
# MAIN EXECUTION
# =============================================================================

if __name__ == '__main__':
    import sys
    import threading
    
    print("\n" + "="*70)
    print("  🚀 SurakshaNet Unified Backend Starting...")
    print("="*70)
    print("\n" + "="*70)
    print("  Services Configuration")
    print("="*70)
    print(f"📡 Flask API: http://127.0.0.1:5000")
    print(f"   - POST /ingest: Log ingestion endpoint")
    print(f"   - GET  /dashboard: Dashboard data endpoint")
    print(f"💾 Storage: PostgreSQL Database")
    print(f"   - Database: surakshanet_db")
    print(f"   - Host: localhost:5432")
    print(f"📊 System Stats (FastAPI): http://127.0.0.1:8001")
    print(f"   - GET  /stats: HTTP stats endpoint")
    print(f"   - WS   /ws/stats: WebSocket stats stream")
    print("="*70)
    print("\n⚠️  Make sure blockchain server is running on port 3001!\n")
    
    # Start FastAPI in a separate thread
    def run_fastapi():
        import uvicorn
        uvicorn.run(
            fastapi_app,
            host="127.0.0.1",
            port=8001,
            log_level="warning"
        )
    
    fastapi_thread = threading.Thread(target=run_fastapi, daemon=True)
    fastapi_thread.start()
    print("✅ FastAPI System Stats Service started on port 8001\n")
    
    # Run Flask app
    print("✅ Starting Flask API on port 5000...\n")
    app.run(host='127.0.0.1', port=5000, debug=True, use_reloader=False)