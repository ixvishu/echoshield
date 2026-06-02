from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CitizenReportBase(BaseModel):
    reporter_name: str
    reporter_phone: Optional[str] = None
    incident_type: str
    location: str
    latitude: float
    longitude: float
    description: str
    image_url: Optional[str] = None

class CitizenReportCreate(CitizenReportBase):
    pass

class CitizenReportOut(CitizenReportBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class SensorDataBase(BaseModel):
    sensor_name: str
    sensor_type: str
    latitude: float
    longitude: float
    reading: float
    battery: str
    status: str

class SensorDataOut(SensorDataBase):
    id: str
    updated_at: datetime

    class Config:
        from_attributes = True

class EmergencyResourceBase(BaseModel):
    resource_name: str
    resource_type: str
    status: str
    location: str
    latitude: float
    longitude: float
    contact: Optional[str] = None

class EmergencyResourceOut(EmergencyResourceBase):
    id: str

    class Config:
        from_attributes = True

class SystemAlertBase(BaseModel):
    alert_text: str
    severity: str
    target_area: str

class SystemAlertOut(SystemAlertBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
