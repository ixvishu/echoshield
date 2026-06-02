from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from .database import Base
import enum

class IncidentStatus(str, enum.Enum):
    PENDING = "Pending"
    VERIFIED = "Verified"
    ASSIGNED = "Assigned"
    RESOLVED = "Resolved"

class ResourceStatus(str, enum.Enum):
    STANDBY = "Standby"
    ACTIVE = "Active"

class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_name = Column(String, nullable=False)
    reporter_phone = Column(String, nullable=True)
    incident_type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, default="Pending")
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(String, primary_key=True, index=True)
    sensor_name = Column(String, nullable=False)
    sensor_type = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    reading = Column(Float, nullable=False)
    battery = Column(String, default="100%")
    status = Column(String, default="ONLINE")
    updated_at = Column(DateTime, default=datetime.utcnow)

class EmergencyResource(Base):
    __tablename__ = "emergency_resources"

    id = Column(String, primary_key=True, index=True)
    resource_name = Column(String, nullable=False)
    resource_type = Column(String, nullable=False) # e.g. "Rescue Team", "Ambulance"
    status = Column(String, default="Standby")
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact = Column(String, nullable=True)

class SystemAlert(Base):
    __tablename__ = "system_alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_text = Column(String, nullable=False)
    severity = Column(String, default="Moderate") # e.g. "Critical", "Moderate", "Advisory"
    target_area = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
