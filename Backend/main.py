from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
import json
import asyncio

# Local Imports
from .database import engine, Base
from .schemas import CitizenReportCreate, CitizenReportOut, SystemAlertBase, SystemAlertOut
from .models import CitizenReport, SensorData, EmergencyResource, SystemAlert

# Create DB Tables if they do not exist
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: PostgreSQL tables could not be created automatically: {e}")

app = FastAPI(
    title="EcoShield AI – Environmental Intelligence Backend",
    version="1.0.0",
    description="Government-grade disaster warning and resilience coordination service."
)

# CORS Policy Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Fallback State (useful for standalone local presentation)
MOCK_REPORTS = [
    {"id": 104, "reporter_name": "Ramesh Sharma", "reporter_phone": "+91 98765 43210", "incident_type": "Flood", "location": "Bangalore City Sector 4", "latitude": 12.612, "longitude": 77.158, "description": "Water level rising rapidly. Road flooded upto knee level.", "status": "Pending", "created_at": datetime.utcnow(), "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=300&q=80"},
    {"id": 103, "reporter_name": "Ananya Deshmukh", "reporter_phone": "+91 88822 11445", "incident_type": "Tree Fall", "location": "Koramangala Road", "latitude": 12.598, "longitude": 77.142, "description": "Large banyan tree fallen across main street, blocking traffic and power lines.", "status": "Verified", "created_at": datetime.utcnow(), "image_url": "https://images.unsplash.com/photo-1594756297462-ec7a6c9d747a?auto=format&fit=crop&w=300&q=80"},
    {"id": 102, "reporter_name": "Vikram Singh", "reporter_phone": "+91 70123 45678", "incident_type": "Water Leakage", "location": "Whitefield Reservoir Pipe Line", "latitude": 12.625, "longitude": 77.045, "description": "Major rupture in 12-inch water main, wasting thousands of gallons.", "status": "Assigned", "created_at": datetime.utcnow(), "image_url": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80"}
]

MOCK_RESOURCES = [
    {
        "id": "RES-01", 
        "name": "BBMP Disaster Cell Team A", "resource_name": "BBMP Disaster Cell Team A",
        "type": "Rescue Team", "resource_type": "Rescue Team",
        "status": "Active", "location": "Silk Board Junction", 
        "lat": 12.919, "latitude": 12.919, 
        "lng": 77.620, "longitude": 77.620, 
        "contact": "Supervisor Srinivas"
    },
    {
        "id": "RES-02", 
        "name": "SDRF Water Rescue Squad", "resource_name": "SDRF Water Rescue Squad",
        "type": "Rescue Team", "resource_type": "Rescue Team",
        "status": "Standby", "location": "Bellandur Outpost", 
        "lat": 12.935, "latitude": 12.935, 
        "lng": 77.665, "longitude": 77.665, 
        "contact": "Officer Manjunath"
    },
    {
        "id": "RES-03", 
        "name": "HAL Emergency Ambulance", "resource_name": "HAL Emergency Ambulance",
        "type": "Ambulance", "resource_type": "Ambulance",
        "status": "Active", "location": "HAL Airport Road Hospital", 
        "lat": 12.956, "latitude": 12.956, 
        "lng": 77.652, "longitude": 77.652, 
        "contact": "Paramedic Vinod"
    },
    {
        "id": "RES-04", 
        "name": "Hebbal Relief Shelter 1", "resource_name": "Hebbal Relief Shelter 1",
        "type": "Shelter", "resource_type": "Shelter",
        "status": "Open (120/400)", "location": "Hebbal Ground", 
        "lat": 13.035, "latitude": 13.035, 
        "lng": 77.597, "longitude": 77.597, 
        "contact": "Coordinator Murthy"
    },
    {
        "id": "RES-05", 
        "name": "BBMP Fire Station Central", "resource_name": "BBMP Fire Station Central",
        "type": "Fire Station", "resource_type": "Fire Station",
        "status": "Standby", "location": "MG Road Station", 
        "lat": 12.975, "latitude": 12.975, 
        "lng": 77.608, "longitude": 77.608, 
        "contact": "Station Chief Kumar"
    },
    {
        "id": "RES-06", 
        "name": "Police Patrol Vehicle 14", "resource_name": "Police Patrol Vehicle 14",
        "type": "Police Vehicle", "resource_type": "Police Vehicle",
        "status": "Active", "location": "Koramangala 5th Block", 
        "lat": 12.934, "latitude": 12.934, 
        "lng": 77.618, "longitude": 77.618, 
        "contact": "Officer Gowda"
    }
]

MOCK_ALERTS = [
    {"id": 1, "alert_text": "Flood warning issued for low-lying areas of River Bellandur.", "severity": "Critical", "target_area": "Bangalore East", "created_at": datetime.utcnow()},
    {"id": 2, "alert_text": "Air Quality Index (AQI) exceeded 280 in Bangalore Central.", "severity": "Moderate", "target_area": "Bangalore Central", "created_at": datetime.utcnow()}
]

# --- WEBSOCKET CONNECTION MANAGER ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Remove dead connection
                pass

manager = ConnectionManager()

tracking_users = {}

async def simulate_moving_assets():
    import math
    import random
    angles = {res["id"]: random.uniform(0, 2*math.pi) for res in MOCK_RESOURCES}
    
    while True:
        await asyncio.sleep(1.0)
        for res in MOCK_RESOURCES:
            if res["type"] in ["Rescue Team", "Ambulance", "Fire Station", "Police Vehicle"] and res["id"] != "RES-04":
                angle = angles[res["id"]]
                angle += random.uniform(-0.3, 0.3)
                angles[res["id"]] = angle
                speed = 0.00015
                res["lat"] += speed * math.sin(angle)
                res["latitude"] = res["lat"]
                res["lng"] += speed * math.cos(angle)
                res["longitude"] = res["lng"]
                
                # Keep within Bangalore bounds approximately
                if res["lat"] < 12.85:
                    res["lat"] = 12.85
                    res["latitude"] = 12.85
                    angles[res["id"]] += math.pi
                elif res["lat"] > 13.08:
                    res["lat"] = 13.08
                    res["latitude"] = 13.08
                    angles[res["id"]] += math.pi
                if res["lng"] < 77.50:
                    res["lng"] = 77.50
                    res["longitude"] = 77.50
                    angles[res["id"]] += math.pi
                elif res["lng"] > 77.76:
                    res["lng"] = 77.76
                    res["longitude"] = 77.76
                    angles[res["id"]] += math.pi

        try:
            await manager.broadcast(json.dumps({
                "event": "RESOURCE_UPDATE",
                "resources": MOCK_RESOURCES,
                "active_users": tracking_users,
                "online_count": len(manager.active_connections)
            }))
        except Exception:
            pass

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_moving_assets())

@app.get("/")
def read_root():
    return {"message": "Welcome to EcoShield AI Platforms API."}

# --- CITIZEN REPORTS ---
@app.get("/api/reports", response_model=List[CitizenReportOut])
def get_reports():
    # Return mock data for presentation purposes
    return MOCK_REPORTS

@app.post("/api/reports", status_code=status.HTTP_201_CREATED)
async def create_report(report: CitizenReportCreate):
    new_rep = {
        "id": len(MOCK_REPORTS) + 105,
        "reporter_name": report.reporter_name,
        "reporter_phone": report.reporter_phone,
        "incident_type": report.incident_type,
        "location": report.location,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "description": report.description,
        "status": "Pending",
        "created_at": datetime.utcnow(),
        "image_url": report.image_url or "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=300&q=80"
    }
    MOCK_REPORTS.insert(0, new_rep)
    
    # Broadcast websocket update to listening admin dashboards
    await manager.broadcast(json.dumps({
        "event": "NEW_REPORT",
        "data": {
            "id": new_rep["id"],
            "type": new_rep["incident_type"],
            "location": new_rep["location"]
        }
    }))
    return new_rep

@app.put("/api/reports/{id}/verify")
def verify_report(id: int):
    for r in MOCK_REPORTS:
        if r["id"] == id:
            r["status"] = "Verified"
            return r
    raise HTTPException(status_code=404, detail="Incident report not found")

@app.put("/api/reports/{id}/dispatch")
def dispatch_report(id: int, res_id: str):
    for r in MOCK_REPORTS:
        if r["id"] == id:
            r["status"] = "Assigned"
            for res in MOCK_RESOURCES:
                if res["id"] == res_id:
                    res["status"] = "Active"
            return r
    raise HTTPException(status_code=404, detail="Incident report not found")

# --- EMERGENCY RESOURCES ---
@app.get("/api/resources")
def get_resources():
    return MOCK_RESOURCES

# --- EARLY WARNINGS ---
@app.get("/api/alerts")
def get_alerts():
    return MOCK_ALERTS

@app.post("/api/alerts/broadcast")
async def broadcast_alert(alert: SystemAlertBase):
    new_alert = {
        "id": len(MOCK_ALERTS) + 1,
        "alert_text": alert.alert_text,
        "severity": alert.severity,
        "target_area": alert.target_area,
        "created_at": datetime.utcnow()
    }
    MOCK_ALERTS.insert(0, new_alert)
    
    await manager.broadcast(json.dumps({
        "event": "NEW_ALERT",
        "data": new_alert
    }))
    return new_alert

# --- AI PREDICTIONS FORECAST ---
@app.get("/api/predictions")
def get_predictions():
    return {
        "flood_probability": 0.87,
        "river_forecast_msl": [47.5, 47.7, 47.9, 48.2, 48.6, 49.1, 49.5],
        "drought_outlook_days": 44,
        "heatwave_index_max_temp": 42.8,
        "resource_recommendations": {
            "ambulances": 12,
            "rescue_boats": 5,
            "relief_beds": 850
        }
    }

# --- WEBSOCKET CHANNEL ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state
        await websocket.send_text(json.dumps({
            "event": "INIT_STATE",
            "active_users": tracking_users,
            "resources": MOCK_RESOURCES,
            "online_count": len(manager.active_connections)
        }))
        
        while True:
            data_str = await websocket.receive_text()
            try:
                msg = json.loads(data_str)
                if msg.get("type") == "USER_GPS_UPDATE":
                    user_id = msg.get("userId", "anonymous")
                    user_data = msg.get("data", {})
                    if "timestamp" not in user_data:
                        user_data["timestamp"] = datetime.utcnow().strftime("%H:%M:%S")
                    tracking_users[user_id] = user_data
                    
                    # Broadcast update to all
                    await manager.broadcast(json.dumps({
                        "event": "USER_GPS_UPDATE",
                        "userId": user_id,
                        "data": user_data,
                        "active_users": tracking_users,
                        "online_count": len(manager.active_connections)
                    }))
            except Exception as e:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
