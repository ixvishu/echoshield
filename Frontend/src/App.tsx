import { GoogleGenerativeAI } from '@google/generative-ai';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Wifi, 
  Activity, 
  Map as MapIcon, 
  Brain, 
  Wind, 
  Users, 
  Truck, 
  AlertTriangle, 
  Leaf, 
  Sliders, 
  FileText, 
  Calendar, 
  Clock,
  Mail,
  Key,
  Sparkles,
  Globe,
  Terminal,
  Lock,
  CheckCircle2,
  Bot,
  MessageSquare,
  Send,
  X,
  Sun,
  Moon,
  MapPin
} from 'lucide-react';

// Subcomponents
import CommandCenter from './components/CommandCenter';
import GisMap from './components/GisMap';
import AiPrediction from './components/AiPrediction';
import CopilotCenter from './components/CopilotCenter';
import EnvironmentalMonitoring from './components/EnvironmentalMonitoring';
import CitizenReporting from './components/CitizenReporting';
import EmergencyManagement from './components/EmergencyManagement';
import EarlyWarning from './components/EarlyWarning';
import SustainabilityAnalytics from './components/SustainabilityAnalytics';
import AdminPanel from './components/AdminPanel';
import ReportingModule from './components/ReportingModule';

export interface CitizenReport {
  id: string;
  name: string;
  phone: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  desc: string;
  status: 'Pending' | 'Verified' | 'Assigned' | 'Resolved';
  time: string;
  image: string;
}

export interface EmergencyResource {
  id: string;
  name: string;
  type: string;
  status: 'Standby' | 'Active';
  location: string;
  lat: number;
  lng: number;
  contact: string;
}

export interface SystemAlert {
  id: number;
  text: string;
  type: 'danger' | 'warning' | 'info';
  time: string;
}

const INITIAL_REPORTS: CitizenReport[] = [
  { id: "REP-104", name: "Ramesh Sharma", phone: "+91 98765 43210", type: "Flood", location: "Bangalore City Sector 4", lat: 12.952, lng: 77.638, desc: "Water level rising rapidly. Road flooded upto knee level.", status: "Pending", time: "10 mins ago", image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=300&q=80" },
  { id: "REP-103", name: "Ananya Deshmukh", phone: "+91 88822 11445", type: "Tree Fall", location: "Koramangala Road", lat: 12.938, lng: 77.622, desc: "Large banyan tree fallen across main street, blocking traffic and power lines.", status: "Verified", time: "25 mins ago", image: "https://images.unsplash.com/photo-1594756297462-ec7a6c9d747a?auto=format&fit=crop&w=300&q=80" },
  { id: "REP-102", name: "Vikram Singh", phone: "+91 70123 45678", type: "Water Leakage", location: "Whitefield Reservoir Pipe Line", lat: 12.965, lng: 77.525, desc: "Major rupture in 12-inch water main, wasting thousands of gallons.", status: "Assigned", time: "1 hour ago", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80" },
  { id: "REP-101", name: "Dr. K. Raghavan", phone: "+91 94440 12345", type: "Pollution", location: "Industrial Area Phase II", lat: 12.921, lng: 77.579, desc: "Chemical runoff observed in local stream, turning water milky white.", status: "Resolved", time: "3 hours ago", image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=300&q=80" },
];

const EMERGENCY_RESOURCES: EmergencyResource[] = [
  { id: "RES-01", name: "Bangalore NDRF Unit A", type: "Rescue Team", status: "Active", location: "Bangalore City", lat: 12.955, lng: 77.640, contact: "Inspector Rawat" },
  { id: "RES-02", name: "Bellandur Flood Boat 3", type: "Rescue Team", status: "Standby", location: "Bellandur Ghat", lat: 12.968, lng: 77.600, contact: "Sub-Inspector Prasad" },
  { id: "RES-03", name: "Emergency Ambulance 12", type: "Ambulance", status: "Active", location: "Victoria Hospital", lat: 12.961, lng: 77.630, contact: "Driver Shashi" },
  { id: "RES-04", name: "Civil Defense Shelter 2", type: "Shelter", status: "Active", location: "Koramangala Stadium", lat: 12.939, lng: 77.628, contact: "Coordinator Verma" },
  { id: "RES-05", name: "District Fire Unit 4", type: "Fire Station", status: "Standby", location: "MG Road Station", lat: 12.951, lng: 77.598, contact: "Station Officer Sen" },
];

const INITIAL_ALERTS: SystemAlert[] = [
  { id: 1, text: "Flood warning issued for low-lying areas of River Bellandur.", type: "danger", time: "Just now" },
  { id: 2, text: "Air Quality Index (AQI) exceeded 280 in Bangalore Central.", type: "warning", time: "1 hour ago" },
  { id: 3, text: "Sensor Node S-402: Reservoir level drop detected (-0.8m).", type: "info", time: "2 hours ago" }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDemoConnecting, setIsDemoConnecting] = useState(false);
  const [introTab, setIntroTab] = useState("login"); // "login" or "report"

  // Public citizen reporting form states
  const [publicName, setPublicName] = useState("");
  const [publicPhone, setPublicPhone] = useState("");
  const [publicType, setPublicType] = useState("Flood");
  const [publicLocation, setPublicLocation] = useState("");
  const [publicLat, setPublicLat] = useState<number | null>(null);
  const [publicLng, setPublicLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [publicDesc, setPublicDesc] = useState("");
  const [publicSuccess, setPublicSuccess] = useState("");

  // Intro telemetry simulation logs
  const [telemetryLogs, setTelemetryLogs] = useState([
    { id: 1, text: "GCP Telemetry stream linked successfully.", time: "10:45:12" },
    { id: 2, text: "Sensor Node S-101 (Silk Board PM2.5): 165 AQI (Normal variance).", time: "10:46:01" },
    { id: 3, text: "GisMap layer loaded: 3 raster overlays cached.", time: "10:46:18" },
    { id: 4, text: "Bellandur lake level telemetry verified at 12.4m.", time: "10:47:02" },
  ]);

  // Telemetry log updates (Intro page only)
  useEffect(() => {
    if (isLoggedIn) return;
    const interval = setInterval(() => {
      const msgs = [
        "Sensor Node S-102 (Bellandur Lake) level stabilized at 12.4m",
        "TG Halli reservoir level telemetry tick: 28.5%",
        "AQI reading update: 168 (Peenya Industrial)",
        "Weather API response: Temp 31.2°C, Humidity 68%",
        "SMS/EWS broadcast system ready on channels 1-4",
        "GCP BigQuery cluster ingestion: 120 events/sec ingested"
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setTelemetryLogs(prev => [
        { id: Date.now(), text: randomMsg, time: timeStr },
        ...prev.slice(0, 3)
      ]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Sleek automatic typewriter demo login simulation
  const handleDemoLogin = () => {
    if (isDemoConnecting) return;
    setIsDemoConnecting(true);
    setError("");
    
    const targetEmail = "admin@ecoshield.gov.in";
    const targetPassword = "admin";
    
    let currentEmail = "";
    let emailIdx = 0;
    
    const typeEmailInterval = setInterval(() => {
      if (emailIdx < targetEmail.length) {
        currentEmail += targetEmail[emailIdx];
        setEmail(currentEmail);
        emailIdx++;
      } else {
        clearInterval(typeEmailInterval);
        
        // Short pause, then type password
        setTimeout(() => {
          let currentPassword = "";
          let passIdx = 0;
          const typePassInterval = setInterval(() => {
            if (passIdx < targetPassword.length) {
              currentPassword += targetPassword[passIdx];
              setPassword(currentPassword);
              passIdx++;
            } else {
              clearInterval(typePassInterval);
              
              // Authenticating spinner
              setTimeout(() => {
                setIsLoggedIn(true);
                setIsDemoConnecting(false);
              }, 600);
            }
          }, 60);
        }, 200);
      }
    }, 30);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoConnecting) return;
    if (email === "admin@ecoshield.gov.in" && password === "admin") {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Invalid username or password. Please use the credentials provided in the helper box.");
    }
  };

  const handlePublicReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicName || !publicLocation || !publicDesc) return;

    const reportId = `REP-${Math.floor(105 + Math.random() * 1000)}`;
    const newReport: CitizenReport = {
      id: reportId,
      name: publicName,
      phone: publicPhone || "+91 99999 88888",
      type: publicType,
      location: publicLocation,
      lat: publicLat !== null ? publicLat : 12.9716 + (Math.random() - 0.5) * 0.08,
      lng: publicLng !== null ? publicLng : 77.5946 + (Math.random() - 0.5) * 0.08,
      desc: publicDesc,
      status: "Pending",
      time: "Just now",
      image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=300&q=80"
    };

    setReports([newReport, ...reports]);
    setAlerts([
      { id: Date.now(), text: `PUBLIC URGENT: ${publicType} submitted at ${publicLocation}.`, type: "danger", time: "Just now" },
      ...alerts
    ]);

    setPublicSuccess(`Emergency report submitted! Reference ID: ${reportId}. Log in as admin to verify it in the main dashboard queue.`);
    
    // Reset form
    setPublicName("");
    setPublicPhone("");
    setPublicLocation("");
    setPublicLat(null);
    setPublicLng(null);
    setPublicDesc("");
    
    // Clear message after 10 seconds
    setTimeout(() => setPublicSuccess(""), 10000);
  };

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_REPORTS);
  const [resources, setResources] = useState<EmergencyResource[]>(EMERGENCY_RESOURCES);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);

  // Sensor states
  const [sensorAqi, setSensorAqi] = useState<number>(195);
  const [riverLevel, setRiverLevel] = useState<number>(48.2);
  const [reservoirCapacity, setReservoirCapacity] = useState<number>(74);
  const [riskIndex, setRiskIndex] = useState<number>(68);
  const [weather, setWeather] = useState({ temp: 38.5, hum: 45, rain: 12, wind: 14.5 });

  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_key') || '');
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    { sender: 'ai', text: "Hello! I am EcoShield's AI Resilience Assistant. How can I help you coordinate district environmental updates today?", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    // Clock update
    const updateTime = () => {
      const date = new Date();
      setTimeString(date.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    // Sensor mock update (WebSocket simulation)
    const sensorInterval = setInterval(() => {
      setSensorAqi(prev => Math.min(400, Math.max(50, prev + Math.floor(Math.random() * 7) - 3)));
      setRiverLevel(prev => +(prev + (Math.random() * 0.1 - 0.04)).toFixed(2));
      setReservoirCapacity(prev => Math.min(100, Math.max(0, prev + (Math.random() * 0.4 - 0.2))));
      setWeather(prev => ({
        temp: +(prev.temp + (Math.random() * 0.4 - 0.2)).toFixed(1),
        hum: Math.min(100, Math.max(0, prev.hum + Math.floor(Math.random() * 3) - 1)),
        wind: +(prev.wind + (Math.random() * 0.8 - 0.4)).toFixed(1),
        rain: prev.rain
      }));
      setRiskIndex(prev => Math.min(100, Math.max(0, prev + Math.floor(Math.random() * 3) - 1)));
    }, 5000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(sensorInterval);
    };
  }, []);

  const addReport = (newReport: Omit<CitizenReport, 'id' | 'status' | 'time'>) => {
    const report: CitizenReport = {
      ...newReport,
      id: `REP-${Math.floor(105 + Math.random() * 1000)}`,
      status: 'Pending',
      time: 'Just now'
    };
    setReports([report, ...reports]);
    setAlerts([
      { id: Date.now(), text: `NEW REPORT: ${report.type} reported at ${report.location}.`, type: 'danger', time: 'Just now' },
      ...alerts
    ]);
  };

  const verifyReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'Verified' } : r));
  };

  const rejectReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const dispatchResource = (resId: string, repId: string) => {
    setResources(prev => prev.map(r => r.id === resId ? { ...r, status: 'Active' } : r));
    setReports(prev => prev.map(r => r.id === repId ? { ...r, status: 'Assigned' } : r));
  };

  const addAlert = (text: string, type: 'danger' | 'warning' | 'info') => {
    setAlerts([{ id: Date.now(), text, type, time: 'Just now' }, ...alerts]);
  };

  const getLocalAiResponse = (text: string): string => {
    const query = text.toLowerCase();
    
    if (query.includes("where am i")) {
      if (userLocation) {
        const lat = userLocation.lat;
        const lng = userLocation.lng;
        const nearestShelterInfo = findNearestShelter(lat, lng, [...resources, ...localResources]);
        const nearestShelterName = nearestShelterInfo ? nearestShelterInfo.shelter.name : "None found";
        const nearestShelterDist = nearestShelterInfo ? (nearestShelterInfo.distance / 1000).toFixed(2) + " km" : "N/A";
        
        const floodPoly = getFloodPolygon(lat, lng);
        const isInsideFlood = isPointInPolygon(lat, lng, floodPoly);

        return `<div class="space-y-2">
          <div class="font-bold text-cyan-400">📍 Live GPS Telemetry</div>
          <div>Coordinates: <span class="font-bold text-white">${lat.toFixed(5)}, ${lng.toFixed(5)}</span></div>
          <div>Address: <span class="font-bold text-white">${userLocation.district}, ${userLocation.city}, ${userLocation.state}</span></div>
          <div class="bg-slate-900/50 p-2 rounded text-[10px]">
            Flood Risk Status: <span class="font-bold ${isInsideFlood ? 'text-red-450' : 'text-slate-400'}">${isInsideFlood ? 'CRITICAL BASIN' : 'Safe'}</span><br/>
            Nearest Shelter: <span class="font-bold text-emerald-400">${nearestShelterName}</span> (${nearestShelterDist} away)
          </div>
        </div>`;
      }
      return "Obtaining GPS lock. Please wait 5 seconds and request coordinates again.";
    }

    if (query.includes("flood zone") || query.includes("am i in danger") || query.includes("flood risk")) {
      if (userLocation) {
        const lat = userLocation.lat;
        const lng = userLocation.lng;
        const floodPoly = getFloodPolygon(lat, lng);
        const isInsideFlood = isPointInPolygon(lat, lng, floodPoly);
        const nearestShelterInfo = findNearestShelter(lat, lng, [...resources, ...localResources]);
        const nearestShelterName = nearestShelterInfo ? nearestShelterInfo.shelter.name : "None found";
        const nearestShelterDist = nearestShelterInfo ? (nearestShelterInfo.distance / 1000).toFixed(2) + " km" : "N/A";

        if (isInsideFlood) {
          return `<div class="space-y-2 text-red-400">
            <div class="font-bold"><i class="fa-solid fa-triangle-exclamation mr-1"></i> FLOOD HAZARD WARNING</div>
            <p class="text-white text-[10px]">Your current coordinates lie inside the active <b>Flood-Prone Overlays Zone</b>.</p>
            <div class="bg-red-955/20 border border-red-900/40 p-2 rounded text-[10px] text-slate-350">
              Recommendation: Evacuate immediately to:<br/>
              <b>${nearestShelterName}</b> (${nearestShelterDist} away, Contact: ${nearestShelterInfo?.shelter.contact || 'EWS Center'})
            </div>
          </div>`;
        } else {
          return `<div class="space-y-2 text-emerald-450">
            <div class="font-bold">✅ FLOOD STATUS: SAFE</div>
            <p class="text-slate-300 text-[10px]">Your coordinates are in a safe zone outside active flood boundaries. Local sensors report <b>${riverLevel}m</b>.</p>
          </div>`;
        }
      }
      return "Awaiting geolocation coordinate lock. Please check again.";
    }

    if (query.includes("nearest shelter") || query.includes("show shelter") || query.includes("find shelter")) {
      if (userLocation) {
        const lat = userLocation.lat;
        const lng = userLocation.lng;
        const nearestShelterInfo = findNearestShelter(lat, lng, [...resources, ...localResources]);
        if (nearestShelterInfo) {
          return `<div class="space-y-2">
            <div class="font-bold text-emerald-400">🏠 Closest Relief Shelter</div>
            <div>Name: <span class="font-bold text-white">${nearestShelterInfo.shelter.name}</span></div>
            <div>Distance: <span class="font-bold text-white">${(nearestShelterInfo.distance / 1000).toFixed(2)} km</span></div>
            <div class="bg-slate-900/50 p-2 rounded text-[10px] text-slate-400">
              Location: ${nearestShelterInfo.shelter.location}<br/>
              Contact: <b>${nearestShelterInfo.shelter.contact || 'EWS Hotline'}</b>
            </div>
          </div>`;
        }
      }
      return "Awaiting GPS tracking stream.";
    }

    if (query.includes("nearby hospital") || query.includes("show hospital") || query.includes("find hospital") || query.includes("show nearby hospital") || query.includes("nearby hospitals") || query.includes("show hospitals")) {
      if (userLocation) {
        const lat = userLocation.lat;
        const lng = userLocation.lng;
        const allRes = [...resources, ...localResources];
        const hospitals = allRes.filter(r => r.type === 'Hospital' || r.type === 'Ambulance');
        const list = hospitals.map(h => {
          const d = (getDistance(lat, lng, h.lat, h.lng) / 1000).toFixed(2);
          return `<li><b>${h.name}</b> (${d} km, Contact: ${h.contact})</li>`;
        }).join("");

        return `<div class="space-y-2">
          <div class="font-bold text-red-400">🏥 Nearby Medical Facilities</div>
          <ul class="list-disc pl-4 space-y-1 text-[10px] text-slate-350">
            ${list || '<li>No medical stations indexed in the current dispatch sector.</li>'}
          </ul>
        </div>`;
      }
      return "Awaiting GPS tracking stream.";
    }

    if (query.includes('aqi') || query.includes('air quality') || query.includes('peenya') || query.includes('pollution')) {
      const status = sensorAqi > 200 ? 'UNHEALTHY' : sensorAqi > 100 ? 'MODERATE' : 'GOOD';
      return `<div class="space-y-2">
        <div class="font-bold text-cyan-400">🌬️ AQI Analysis Report</div>
        <div>The Peenya Industrial AQI sensor is reading <b>${sensorAqi} PM2.5</b>.</div>
        <div class="bg-slate-900/50 p-2 rounded text-[10px]">
          Status: <span class="font-bold ${sensorAqi > 200 ? 'text-red-450' : 'text-cyan-400'}">${status}</span><br/>
          Recommendation: ${sensorAqi > 200 ? 'Issue public health warning and halt outdoor industrial activities.' : 'Air quality is within acceptable limits.'}
        </div>
      </div>`;
    }

    if (query.includes('flood') || query.includes('waterlog') || query.includes('lake') || query.includes('bellandur')) {
      const status = riverLevel > 12.8 ? 'CRITICAL HIGH' : 'STABLE';
      return `<div class="space-y-2">
        <div class="font-bold text-cyan-400">💧 Flood Risk Assessment</div>
        <div>Bellandur Lake telemetry indicates a depth of <b>${riverLevel}m</b>.</div>
        <div class="bg-slate-900/50 p-2 rounded text-[10px]">
          Current Status: <b>${status}</b><br/>
          AI Prediction: ${riverLevel > 12.8 ? 'Flooding imminent on Outer Ring Road. Deploy NDRF.' : 'Water levels expected to remain stable for next 24hrs.'}
        </div>
      </div>`;
    }

    if (query.includes('reservoir') || query.includes('water shortage') || query.includes('capacity') || query.includes('tg halli')) {
      const status = reservoirCapacity < 30 ? 'CRITICAL LOW' : 'ADEQUATE';
      return `<div class="space-y-2">
        <div class="font-bold text-cyan-400">🛢️ Reservoir Telemetry</div>
        <div>TG Halli Reservoir is at <b>${reservoirCapacity.toFixed(1)}%</b> capacity.</div>
        <div class="bg-slate-900/50 p-2 rounded text-[10px]">
          Status: <b>${status}</b><br/>
          Drought Risk: ${reservoirCapacity < 30 ? 'High. Implement Stage 2 water rationing.' : 'Low. Sufficient reserves for current season.'}
        </div>
      </div>`;
    }

    if (query.includes('report') || query.includes('incidents') || query.includes('active') || query.includes('public') || query.includes('count')) {
      const pending = reports.filter(r => r.status === 'Pending').length;
      return `<div class="space-y-2">
        <div class="font-bold text-cyan-400">📋 Citizen Report Summary</div>
        <div>Total incidents logged: <b>${reports.length}</b></div>
        <div class="bg-slate-900/50 p-2 rounded text-[10px]">
          <b>${pending}</b> pending reports require BBMP verification.
        </div>
      </div>`;
    }

    if (query.includes('help') || query.includes('features') || query.includes('website')) {
      return `<div class="space-y-2">
        <div class="font-bold text-cyan-400">🤖 EcoShield AI System Features:</div>
        <ul class="list-disc pl-4 space-y-1 text-[10px] text-slate-350">
          <li>Real-time telemetry (AQI, Lake Depth, Weather)</li>
          <li>Interactive GIS threat mapping</li>
          <li>AI predictive river-level models</li>
          <li>Citizen incident portal integration</li>
        </ul>
      </div>`;
    }

    return `I am the EcoShield AI Assistant. I can provide detailed structural analysis on **Peenya AQI**, **Bellandur Lake levels**, **TG Halli reservoir capacity**, or **active citizen reports**. Please select a quick prompt.`;
  };

  const handleSendMessage = async (text: string) => {
    if (isTyping) return;
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const userMsg = { sender: 'user' as const, text, time: timeStr };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    const query = text.toLowerCase();
    const isWhereAmI = query.includes("where am i");
    const isFloodZone = query.includes("flood zone") || query.includes("am i in a flood") || query.includes("flood risk");
    const isNearestShelter = query.includes("nearest shelter") || query.includes("show shelter") || query.includes("find shelter");
    const isNearbyHospitals = query.includes("nearby hospital") || query.includes("show hospital") || query.includes("find hospital") || query.includes("show nearby hospital") || query.includes("nearby hospitals") || query.includes("show hospitals");

    if (isNearestShelter) {
      setActiveTab("map");
      setMapAction({ type: 'show_shelter', timestamp: Date.now() });
    } else if (isNearbyHospitals) {
      setActiveTab("map");
      setMapAction({ type: 'show_hospitals', timestamp: Date.now() });
    } else if (isWhereAmI || isFloodZone) {
      setActiveTab("map");
      setMapAction({ type: 'center_user', timestamp: Date.now() });
    }

    let geoContext = "";
    let localResponse = "";

    if (userLocation) {
      const lat = userLocation.lat;
      const lng = userLocation.lng;
      const allResources = [...resources, ...localResources];
      
      const floodPoly = getFloodPolygon(lat, lng);
      const isInsideFlood = isPointInPolygon(lat, lng, floodPoly);
      
      const landslideCircles = getLandslideCircles(lat, lng);
      const isInsideLandslide = landslideCircles.some(c => getDistance(lat, lng, c.center[0], c.center[1]) < c.radius);
      
      const droughtCircle = getDroughtCircle(lat, lng);
      const isInsideDrought = getDistance(lat, lng, droughtCircle.center[0], droughtCircle.center[1]) < droughtCircle.radius;
      
      const nearestShelterInfo = findNearestShelter(lat, lng, allResources);
      const nearestShelterName = nearestShelterInfo ? nearestShelterInfo.shelter.name : "None found";
      const nearestShelterDist = nearestShelterInfo ? (nearestShelterInfo.distance / 1000).toFixed(2) + " km" : "N/A";
      const nearestShelterContact = nearestShelterInfo ? nearestShelterInfo.shelter.contact : "";

      const nearbyHospitalsList = allResources.filter(f => f.type === 'Hospital').map(h => {
        const dist = (getDistance(lat, lng, h.lat, h.lng) / 1000).toFixed(2);
        return `- ${h.name} (${dist} km away, Contact: ${h.contact})`;
      }).join("\n");

      const floodRiskStr = isInsideFlood ? "CRITICAL (Inside Active Flood Hazard Zone)" : "Low";
      const landslideRiskStr = isInsideLandslide ? "High (Landslide / Erosion hazard area)" : "Low";
      const droughtRiskStr = isInsideDrought ? "Moderate (Dry groundwater basin)" : "Low";
      const aggregateRisk = isInsideFlood ? "CRITICAL" : (isInsideLandslide ? "HIGH" : "NORMAL");

      geoContext = `
USER CURRENT GEOLOCATION CONTEXT:
- Latitude: ${lat.toFixed(6)}
- Longitude: ${lng.toFixed(6)}
- Address: ${userLocation.district}, ${userLocation.city}, ${userLocation.state}
- Environmental Sensor AQI: ${sensorAqi} (Moderate)
- Calculated Risks at Coordinates:
  * Flood Risk: ${floodRiskStr}
  * Landslide Risk: ${landslideRiskStr}
  * Drought Risk: ${droughtRiskStr}
  * Aggregate Disaster Risk: ${aggregateRisk}
- Nearest Emergency Shelter: ${nearestShelterName} (Distance: ${nearestShelterDist}, Contact: ${nearestShelterContact})
- Nearby Hospitals:
${nearbyHospitalsList}

Please use this precise local real-time context to answer the user's question accurately. Mention specific coordinates, district, city, risks, and closest facilities names/distances as calculated above.
`;

      if (isWhereAmI) {
        localResponse = `You are currently geolocated at **${userLocation.district}, ${userLocation.city}, ${userLocation.state}** (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}). Current environmental metrics: AQI is **${sensorAqi}**, Flood Risk is **${isInsideFlood ? 'CRITICAL' : 'Low'}**, and nearest shelter is **${nearestShelterName}** (**${nearestShelterDist}** away).`;
      } else if (isFloodZone) {
        localResponse = isInsideFlood 
          ? `⚠️ **WARNING**: You are currently inside an active **Flood-Prone Overlays Zone** (River level alert: Critical). Please prepare for evacuation to the nearest shelter: **${nearestShelterName}** (${nearestShelterDist} away).`
          : `✅ You are currently in a **Safe Zone**. The flood risk at your current coordinates is low.`;
      } else if (isNearestShelter) {
        localResponse = `🏠 The nearest safe shelter has been highlighted on your GIS Map: **${nearestShelterName}**, located **${nearestShelterDist}** away from you. Contact: **${nearestShelterContact}**.`;
      } else if (isNearbyHospitals) {
        localResponse = `🏥 Nearby emergency medical facilities have been displayed on the GIS map:\n\n${allResources.filter(f => f.type === 'Hospital').map(h => `${h.name} (${(getDistance(lat, lng, h.lat, h.lng)/1000).toFixed(2)} km away, Contact: ${h.contact})`).join('\n')}`;
      }
    }

    try {
      if (!geminiKey) {
        throw new Error("No Gemini key configured. Fallback to local response.");
      }
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        systemInstruction: "You are the EcoShield AI Assistant. You specialize in providing emergency guidance, climate resilience updates, and disaster management protocols for all of India. Provide brief, concise, and helpful answers."
      });

      const prompt = geoContext ? `${geoContext}\n\nUser Question: ${text}` : text;
      const result = await model.generateContent(prompt);
      const aiText = result.response.text();
      const aiMsg = { sender: 'ai' as const, text: aiText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.warn("Gemini query failed or not configured. Using local fallback.", error);
      const finalResponse = localResponse || getLocalAiResponse(text);
      const aiMsg = { sender: 'ai' as const, text: finalResponse, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      setChatMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderAiChatAssistant = () => {
    return (
      <div className="fixed bottom-6 right-6 z-50 font-mono text-xs select-none">
        {/* Chat Bubble Button */}
        {!chatOpen && (
          <button 
            onClick={() => setChatOpen(true)}
            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl flex items-center justify-center cursor-pointer transition-all border border-blue-500/20 active:scale-95 animate-pulse-slow"
          >
            <Bot className="h-6 w-6" />
          </button>
        )}

        {/* Chat Window */}
        {chatOpen && (
          <div className="bg-[#0b0f17] border border-slate-800 rounded-xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[400px]">
            {/* Chat Header */}
            <div className="bg-[#030712] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-white tracking-wide uppercase text-[10px]">EcoShield AI Assistant</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-mono text-[10px]">
              {!geminiKey && (
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded text-[8px] text-slate-500 mb-2 leading-normal">
                  ℹ️ Using offline telemetry backup model. Paste Gemini API Key and press Enter to enable live LLM reasoning.
                  <input 
                    type="password"
                    placeholder="Paste Gemini API Key & press Enter..."
                    className="bg-black/40 border border-slate-750 rounded p-1 text-[8px] w-full text-white mt-1 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.currentTarget as HTMLInputElement).value;
                        if (val) {
                          localStorage.setItem('gemini_key', val);
                          setGeminiKey(val);
                        }
                      }
                    }}
                  />
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-2.5 rounded-lg leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600/90 text-white rounded-br-none text-right' 
                      : 'bg-slate-900 border border-slate-800 text-slate-350 rounded-bl-none text-left'
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}></div>
                    <div className="text-[8px] text-slate-500 mt-1 text-right">{msg.time}</div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg rounded-bl-none text-slate-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
            </div>
 
            {/* Quick Prompts Starter Chips */}
            {chatMessages.length === 1 && (
              <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-900/60 flex flex-wrap gap-1.5">
                <button 
                  onClick={() => handleSendMessage("Check Peenya AQI")}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-2 py-1 rounded text-[9px] text-slate-300 cursor-pointer transition-colors"
                >
                  📍 Peenya AQI
                </button>
                <button 
                  onClick={() => handleSendMessage("Check Bellandur flood level")}
                  className="bg-slate-900 hover:bg-slate-855 border border-slate-800 px-2 py-1 rounded text-[9px] text-slate-300 cursor-pointer transition-colors"
                >
                  💧 Bellandur Lake
                </button>
              </div>
            )}
 
            {/* Chat Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                handleSendMessage(chatInput);
              }}
              className="bg-[#030712] border-t border-slate-800 p-2 flex gap-2"
            >
              <input 
                type="text" 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your resilience inquiry..." 
                className="flex-1 bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500/40 text-slate-200"
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded cursor-pointer transition-colors flex items-center justify-center"
              >
                <Send className="h-3 w-3" />
              </button>
            </form>
          </div>
        )}
      </div>
    );
  };

  const renderLiveFeedItems = () => (
    <>
      {alerts.map((note) => (
        <span key={`note-${note.id}`} className="mx-8 inline-flex items-center gap-2">
          <span className="text-red-500 font-bold">⚠️</span>
          <span className="text-slate-200 font-semibold">{note.text}</span>
          <span className="text-slate-500 text-[9px]">({note.time})</span>
        </span>
      ))}
      {reports.map((rep) => (
        <span key={`rep-${rep.id}`} className="mx-8 inline-flex items-center gap-2">
          <span className="text-blue-400 font-bold">📡</span>
          <span className="text-slate-300">Report {rep.id} [{rep.status.toUpperCase()}]: {rep.type} at {rep.location.split(' (')[0]}</span>
        </span>
      ))}
      <span className="mx-8 inline-flex items-center gap-2">
        <span className="text-emerald-400 font-bold">📊</span>
        <span className="text-slate-300">Peenya AQI: <span className="text-emerald-400 font-bold">{sensorAqi}</span></span>
      </span>
      <span className="mx-8 inline-flex items-center gap-2">
        <span className="text-cyan-400 font-bold">💧</span>
        <span className="text-slate-300">Bellandur Lake: <span className="text-cyan-400 font-bold">{riverLevel}m</span></span>
      </span>
      <span className="mx-8 inline-flex items-center gap-2">
        <span className="text-amber-500 font-bold">⚠️</span>
        <span className="text-slate-300">TG Halli Capacity: <span className="text-amber-400 font-bold">{reservoirCapacity.toFixed(1)}%</span></span>
      </span>
    </>
  );

  const renderLiveFeedBanner = () => {
    return (
      <div className="w-full bg-[#030712] border-b border-red-500/20 text-slate-400 text-xs py-2 px-6 overflow-hidden relative z-30 flex items-center select-none font-mono">
        <span className="bg-red-500/10 border border-red-500/25 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded mr-3 shrink-0 flex items-center gap-1.5 uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Live Bulletin
        </span>
        <div className="flex-1 overflow-hidden relative w-full text-[10px] h-4">
          <div className="absolute whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-pointer flex">
            <div className="flex items-center shrink-0">
              {renderLiveFeedItems()}
            </div>
            <div className="flex items-center shrink-0">
              {renderLiveFeedItems()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- REAL-TIME GEOLOCATION STATES & LOGIC ---
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    district: string;
    city: string;
    state: string;
    addressFetched: boolean;
    timestamp?: string;
    speed?: number;
    direction?: string;
  } | null>(null);

  const [localResources, setLocalResources] = useState<EmergencyResource[]>([]);
  const [mapAction, setMapAction] = useState<{
    type: 'center_user' | 'show_shelter' | 'show_hospitals' | null;
    timestamp: number;
  } | null>(null);

  // Upgraded GIS Tracking States
  const [locationHistory, setLocationHistory] = useState<Array<{ lat: number; lng: number }>>([]);
  const [distanceTraveled, setDistanceTraveled] = useState<number>(0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [currentDirection, setCurrentDirection] = useState<string>("Stationary");
  const [followUser, setFollowUser] = useState<boolean>(true);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [activeTrackedUsers, setActiveTrackedUsers] = useState<any>({});
  const [liveLocationFeed, setLiveLocationFeed] = useState<string[]>([]);
  const [activeBaseMap, setActiveBaseMap] = useState<string>("dark");
  const [evacuationPath, setEvacuationPath] = useState<Array<[number, number]> | null>(null);
  const [geofenceAlert, setGeofenceAlert] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [heatmapType, setHeatmapType] = useState<string>("flood");

  // Latest coordinates ref for the 1-second interval timer
  const latestCoordsRef = useRef<{ lat: number; lng: number; speed?: number | null; heading?: number | null } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Geocoding helper
  const getMockAddress = (lat: number, lng: number) => {
    if (lat >= 12.8 && lat <= 13.1 && lng >= 77.4 && lng <= 77.8) {
      return {
        district: "Koramangala",
        city: "Bengaluru",
        state: "Karnataka"
      };
    }
    return {
      district: "Local District",
      city: "Local City",
      state: "Local State"
    };
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'EcoShield-Resilience-App'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const district = address.suburb || address.neighbourhood || address.county || address.district || "Unknown District";
        const city = address.city || address.town || address.village || "Unknown City";
        const state = address.state || address.region || "Unknown State";
        return { district, city, state };
      }
    } catch (e) {
      console.error("Reverse geocoding failed, falling back to mock", e);
    }
    return getMockAddress(lat, lng);
  };

  // Generate mock facilities around user
  const generateLocalFacilities = (lat: number, lng: number) => {
    return [
      { id: "LOC-HOSP-1", name: "Metro Trauma Hospital", type: "Hospital", status: "Active" as const, location: "Nearby Area", lat: lat + 0.005, lng: lng - 0.004, contact: "+91 99000 11111" },
      { id: "LOC-HOSP-2", name: "City Care Clinic", type: "Hospital", status: "Active" as const, location: "Nearby Area", lat: lat - 0.006, lng: lng + 0.007, contact: "+91 99000 22222" },
      { id: "LOC-SHEL-1", name: "Primary Emergency Shelter", type: "Shelter", status: "Active" as const, location: "Nearby Area", lat: lat + 0.007, lng: lng + 0.005, contact: "+91 99000 33333" },
      { id: "LOC-SHEL-2", name: "Community Relief Shelter", type: "Shelter", status: "Standby" as const, location: "Nearby Area", lat: lat - 0.008, lng: lng - 0.006, contact: "+91 99000 44444" },
      { id: "LOC-FIRE-1", name: "District Fire Station", type: "Fire Station", status: "Standby" as const, location: "Nearby Area", lat: lat - 0.003, lng: lng - 0.002, contact: "+91 99000 55555" },
      { id: "LOC-CAMP-1", name: "EcoShield Relief Camp Alpha", type: "Relief Camp", status: "Active" as const, location: "Nearby Area", lat: lat + 0.009, lng: lng - 0.003, contact: "+91 99000 66666" },
    ];
  };

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // metres
    const phi1 = lat1 * Math.PI/180;
    const phi2 = lat2 * Math.PI/180;
    const deltaPhi = (lat2-lat1) * Math.PI/180;
    const deltaLambda = (lng2-lng1) * Math.PI/180;
    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in metres
  };

  const isPointInPolygon = (lat: number, lng: number, polygon: [number, number][]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = ((yi > lng) !== (yj > lng))
          && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const getFloodPolygon = (lat: number, lng: number): [number, number][] => {
    if (lat >= 12.8 && lat <= 13.1 && lng >= 77.4 && lng <= 77.8) {
      return [
        [12.970, 77.590], [12.972, 77.620], [12.965, 77.660],
        [12.958, 77.660], [12.952, 77.630], [12.959, 77.590]
      ];
    }
    return [
      [lat + 0.004, lng + 0.004],
      [lat + 0.004, lng - 0.004],
      [lat - 0.004, lng - 0.004],
      [lat - 0.004, lng + 0.004]
    ];
  };

  const getLandslideCircles = (lat: number, lng: number) => {
    if (lat >= 12.8 && lat <= 13.1 && lng >= 77.4 && lng <= 77.8) {
      return [
        { center: [12.918, 77.565] as [number, number], radius: 800, name: "Landslide Risk Zone" },
        { center: [12.930, 77.675] as [number, number], radius: 600, name: "Erosion Hazard Zone" }
      ];
    }
    return [
      { center: [lat - 0.006, lng - 0.005] as [number, number], radius: 800, name: "Landslide Risk Zone" },
      { center: [lat + 0.007, lng - 0.007] as [number, number], radius: 600, name: "Erosion Hazard Zone" }
    ];
  };

  const getDroughtCircle = (lat: number, lng: number) => {
    if (lat >= 12.8 && lat <= 13.1 && lng >= 77.4 && lng <= 77.8) {
      return { center: [12.890, 77.610] as [number, number], radius: 2000, name: "Dry Groundwater Basin" };
    }
    return { center: [lat - 0.010, lng + 0.008] as [number, number], radius: 2000, name: "Dry Groundwater Basin" };
  };

  const findNearestShelter = (currentLat: number, currentLng: number, allFacilities: EmergencyResource[]) => {
    const shelters = allFacilities.filter(f => f.type === 'Shelter');
    if (shelters.length === 0) return null;
    
    let nearest = shelters[0];
    let minDistance = getDistance(currentLat, currentLng, nearest.lat, nearest.lng);
    
    for (let i = 1; i < shelters.length; i++) {
      const dist = getDistance(currentLat, currentLng, shelters[i].lat, shelters[i].lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = shelters[i];
      }
    }
    return { shelter: nearest, distance: minDistance };
  };

  // Start tracking user location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      latestCoordsRef.current = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        speed: position.coords.speed,
        heading: position.coords.heading
      };
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error("watchPosition error:", error.message);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    });

    const simPath = [
      { lat: 12.919, lng: 77.620 },
      { lat: 12.922, lng: 77.625 },
      { lat: 12.925, lng: 77.630 },
      { lat: 12.928, lng: 77.635 },
      { lat: 12.932, lng: 77.640 },
      { lat: 12.936, lng: 77.645 },
      { lat: 12.940, lng: 77.650 },
      { lat: 12.944, lng: 77.655 },
      { lat: 12.948, lng: 77.658 },
      { lat: 12.952, lng: 77.652 },
      { lat: 12.956, lng: 77.652 },
      { lat: 12.950, lng: 77.645 },
      { lat: 12.942, lng: 77.638 },
      { lat: 12.934, lng: 77.630 },
      { lat: 12.926, lng: 77.625 }
    ];
    let simIdx = 0;
    let lastLoc: any = null;

    const intervalId = setInterval(async () => {
      let lat = 0;
      let lng = 0;
      let rawSpeed: number | null | undefined = null;
      let rawHeading: number | null | undefined = null;
      let usingSim = false;

      if (latestCoordsRef.current) {
        lat = latestCoordsRef.current.lat;
        lng = latestCoordsRef.current.lng;
        rawSpeed = latestCoordsRef.current.speed;
        rawHeading = latestCoordsRef.current.heading;
      } else {
        const pt = simPath[simIdx];
        lat = pt.lat;
        lng = pt.lng;
        simIdx = (simIdx + 1) % simPath.length;
        usingSim = true;
      }

      // Calculate speed and direction
      let speedKmh = 0;
      let directionStr = "Stationary";

      if (lastLoc) {
        const distM = getDistance(lastLoc.lat, lastLoc.lng, lat, lng);
        
        if (usingSim) {
          speedKmh = Math.floor(45 + Math.random() * 15);
        } else if (rawSpeed !== null && rawSpeed !== undefined) {
          speedKmh = +(rawSpeed * 3.6).toFixed(1);
        } else {
          speedKmh = +(distM * 3.6).toFixed(1);
        }

        if (!usingSim && rawHeading !== null && rawHeading !== undefined) {
          const headings = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
          directionStr = headings[Math.round(((rawHeading % 360) / 45)) % 8];
        } else {
          const dLat = lat - lastLoc.lat;
          const dLng = lng - lastLoc.lng;
          const angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
          const normalized = (angle + 360) % 360;
          const headings = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
          directionStr = headings[Math.round(normalized / 45) % 8];
        }

        setDistanceTraveled(prev => +(prev + (distM / 1000)).toFixed(3));
      }

      setCurrentSpeed(speedKmh);
      setCurrentDirection(speedKmh > 1 ? directionStr : "Stationary");

      let district = "Locating...";
      let city = "Locating...";
      let state = "Locating...";
      let addressFetched = false;

      if (!lastLoc || getDistance(lastLoc.lat, lastLoc.lng, lat, lng) > 50) {
        const addr = await fetchAddress(lat, lng);
        district = addr.district;
        city = addr.city;
        state = addr.state;
        addressFetched = true;
      } else if (lastLoc) {
        district = lastLoc.district;
        city = lastLoc.city;
        state = lastLoc.state;
        addressFetched = lastLoc.addressFetched;
      }

      const currentLocObj = {
        lat,
        lng,
        district,
        city,
        state,
        addressFetched,
        timestamp: new Date().toLocaleTimeString(),
        speed: speedKmh,
        direction: speedKmh > 1 ? directionStr : "Stationary"
      };

      setUserLocation(currentLocObj);
      lastLoc = currentLocObj;

      setLocationHistory(prev => {
        const newHist = [...prev, { lat, lng }];
        if (newHist.length > 100) newHist.shift();
        return newHist;
      });

      setLocalResources(prev => {
        if (prev.length === 0) {
          return generateLocalFacilities(lat, lng);
        }
        return prev;
      });

      // Geofencing Check
      const floodPoly = getFloodPolygon(lat, lng);
      const insideFlood = isPointInPolygon(lat, lng, floodPoly);
      const landslideCircs = getLandslideCircles(lat, lng);
      const insideLandslide = landslideCircs.some(c => getDistance(lat, lng, c.center[0], c.center[1]) < c.radius);
      
      if (insideFlood) {
        setGeofenceAlert("⚠ GEOFENCE ALERT: You have entered a High Flood Risk Area! Avoid low-lying basins and move to higher ground immediately.");
      } else if (insideLandslide) {
        setGeofenceAlert("⚠ GEOFENCE ALERT: You have entered a Vulnerable Landslide Risk Zone! Keep watch for soil shifts and seek shelter.");
      } else {
        setGeofenceAlert(null);
      }

      // Route Optimization
      const allShelters = [...resources, ...generateLocalFacilities(lat, lng)].filter(r => r.type === "Shelter");
      if (allShelters.length > 0) {
        let closest = allShelters[0];
        let minDist = getDistance(lat, lng, closest.lat, closest.lng);
        for (let i = 1; i < allShelters.length; i++) {
          const d = getDistance(lat, lng, allShelters[i].lat, allShelters[i].lng);
          if (d < minDist) {
            minDist = d;
            closest = allShelters[i];
          }
        }
        
        const intermediateLat = (lat + closest.lat) / 2 + 0.003;
        const intermediateLng = (lng + closest.lng) / 2 - 0.003;
        
        setEvacuationPath([
          [lat, lng],
          [intermediateLat, intermediateLng],
          [closest.lat, closest.lng]
        ]);
      }

      // Send GPS Coordinate Update via WebSockets
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "USER_GPS_UPDATE",
          userId: "Officer-Mobile",
          data: currentLocObj
        }));
      }

    }, 1000);

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(intervalId);
    };
  }, []);

  // WebSocket Connection and Live Tracking Sync Effect
  useEffect(() => {
    let wsUrl = "ws://localhost:8000/ws";
    let localTimer: any = null;
    
    const connectWs = () => {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("EcoShield React WebSocket Connected!");
        if (localTimer) clearInterval(localTimer);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "INIT_STATE" || data.event === "RESOURCE_UPDATE") {
            if (data.resources) {
              setResources(data.resources);
            }
            if (data.active_users) {
              setActiveTrackedUsers(data.active_users);
            }
            if (data.online_count !== undefined) {
              setOnlineCount(data.online_count);
            }
          } else if (data.event === "USER_GPS_UPDATE") {
            if (data.active_users) {
              setActiveTrackedUsers(data.active_users);
            }
            if (data.online_count !== undefined) {
              setOnlineCount(data.online_count);
            }
            // Add to live telemetry feeds log widget
            const userTrunc = data.userId.substring(0, 10);
            const timestamp = data.data.timestamp || new Date().toLocaleTimeString();
            const feedMsg = `[Live Tracking] ${userTrunc}: ${data.data.lat.toFixed(5)}, ${data.data.lng.toFixed(5)} at ${timestamp}`;
            setLiveLocationFeed(prev => [feedMsg, ...prev.slice(0, 15)]);
          }
        } catch (e) {
          console.error("WebSocket message parse error:", e);
        }
      };

      ws.onerror = () => {
        console.warn("WebSocket connection error. Standing by for local simulation.");
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected. Retrying in 5 seconds...");
        setTimeout(connectWs, 5000);
      };
    };

    connectWs();

    // Local simulation fallback
    localTimer = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setResources(prev => {
          return prev.map(res => {
            if (res.type !== "Shelter" && res.type !== "Fire Station") {
              const shiftLat = (Math.random() - 0.5) * 0.0003;
              const shiftLng = (Math.random() - 0.5) * 0.0003;
              return {
                ...res,
                lat: res.lat + shiftLat,
                lng: res.lng + shiftLng
              };
            }
            return res;
          });
        });

        setActiveTrackedUsers((prev: any) => {
          const u1Lat = 12.934 + Math.sin(Date.now() / 10000) * 0.01;
          const u1Lng = 77.618 + Math.cos(Date.now() / 10000) * 0.01;
          const u2Lat = 12.956 + Math.cos(Date.now() / 8000) * 0.008;
          const u2Lng = 77.652 + Math.sin(Date.now() / 8000) * 0.008;

          return {
            ...prev,
            "BBMP-Rescue-01": { lat: u1Lat, lng: u1Lng, district: "Koramangala", timestamp: new Date().toLocaleTimeString(), speed: 38, direction: "East" },
            "NDRF-Team-Bravo": { lat: u2Lat, lng: u2Lng, district: "Indiranagar", timestamp: new Date().toLocaleTimeString(), speed: 52, direction: "Northwest" }
          };
        });

        const simulatedUsers = ["BBMP-Rescue-01", "NDRF-Team-Bravo"];
        const selectedUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
        const currentTimestamp = new Date().toLocaleTimeString();
        const mockLat = 12.93 + (Math.random() - 0.5) * 0.03;
        const mockLng = 77.62 + (Math.random() - 0.5) * 0.03;
        const feedMsg = `[Mock Sim] ${selectedUser}: ${mockLat.toFixed(5)}, ${mockLng.toFixed(5)} at ${currentTimestamp}`;
        setLiveLocationFeed(prev => [feedMsg, ...prev.slice(0, 15)]);
        setOnlineCount(3);
      }
    }, 3000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (localTimer) clearInterval(localTimer);
    };
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPublicLat(position.coords.latitude);
        setPublicLng(position.coords.longitude);
        setPublicLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      () => {
        alert("Unable to retrieve your location. Please check your browser permissions.");
        setIsLocating(false);
      }
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-600 selection:text-white grid-bg">
        {renderLiveFeedBanner()}
        {/* Ambient Background Glows */}
        <div className="glow-orb glow-indigo top-[-10%] left-[-10%] animate-pulse-slow"></div>
        <div className="glow-orb glow-emerald bottom-[-10%] right-[-10%] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="glow-orb glow-blue top-[30%] right-[20%] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

        {/* Landing Topbar */}
        <header className="border-b border-slate-900/80 bg-slate-950/40 backdrop-blur-md px-8 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight font-display text-white flex items-center gap-2">
                EcoShield AI
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Systems Active
                </span>
              </div>
              <div className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Climate & Environmental Intelligence</div>
            </div>
          </div>
          
          <div className="flex items-center gap-5 text-xs font-mono text-slate-400">
            <div className="hidden md:flex items-center gap-6">
              <a href="#docs" className="hover:text-white transition-colors">API Docs</a>
              <a href="#changelog" className="hover:text-white transition-colors">v2.4.1-bengaluru</a>
              <span className="h-4 w-px bg-slate-800"></span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest mr-2">BBMP Resilience Node</span>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
            >
              {darkMode ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
              <span className="font-mono text-[10px]">{darkMode ? 'LIGHT' : 'DARK'}</span>
            </button>
          </div>
        </header>

        {/* Split Landing Hero */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Features, Terminal & Description */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs text-blue-400 font-mono">
              <Globe className="text-blue-400 h-3.5 w-3.5" />
              Aligned with UN SDGs (Goal 6, 11, 13)
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-white">
                The Environmental <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                  Operating System
                </span> <br />
                for District Resilience
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed">
                EcoShield AI coordinates real-time telemetry inputs, GIS predictive layers, and multi-channel public warning networks into a single dashboard interface for district administrations.
              </p>
            </div>

            {/* Live Resilience Telemetry Deck */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-lg overflow-hidden shadow-2xl max-w-xl">
              {/* Header */}
              <div className="bg-slate-900/60 border-b border-slate-900/80 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono text-[10px] text-slate-300 font-bold uppercase tracking-wider">Live System Telemetry Grid</span>
                </div>
                <span className="text-[9px] text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10 font-bold font-mono">LIVE CONNECTED</span>
              </div>
              {/* Body */}
              <div className="p-4 space-y-4">
                {/* Grid of Real Sensor Telemetries */}
                <div className="grid grid-cols-3 gap-3">
                  {/* AQI Node */}
                  <div className="bg-[#0b0f17]/40 border border-slate-900 p-2.5 rounded-lg text-center font-mono">
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Peenya AQI</div>
                    <div className={`text-lg font-extrabold mt-1 ${sensorAqi > 200 ? 'text-red-400' : sensorAqi > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {sensorAqi}
                    </div>
                    <div className="text-[8px] text-slate-400 mt-0.5">
                      {sensorAqi > 200 ? 'Unhealthy' : sensorAqi > 100 ? 'Moderate' : 'Good'}
                    </div>
                  </div>
                  {/* Water Level Node */}
                  <div className="bg-[#0b0f17]/40 border border-slate-900 p-2.5 rounded-lg text-center font-mono">
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Bellandur Lake</div>
                    <div className="text-lg font-extrabold text-cyan-400 mt-1">
                      {riverLevel}m
                    </div>
                    <div className="text-[8px] text-slate-400 mt-0.5">
                      {riverLevel > 13.0 ? 'High Level' : 'Normal'}
                    </div>
                  </div>
                  {/* Reservoir Node */}
                  <div className="bg-[#0b0f17]/40 border border-slate-900 p-2.5 rounded-lg text-center font-mono">
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">TG Halli Res.</div>
                    <div className="text-lg font-extrabold text-amber-500 mt-1">
                      {reservoirCapacity.toFixed(1)}%
                    </div>
                    <div className="text-[8px] text-slate-400 mt-0.5">
                      {reservoirCapacity < 30.0 ? 'Critical Low' : 'Adequate'}
                    </div>
                  </div>
                </div>

                {/* Active Incident Feed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-slate-500 uppercase font-bold tracking-wider">Recent Citizen Reports</span>
                    <span className="text-[9px] text-slate-400 font-mono">({reports.length} Verified & Pending)</span>
                  </div>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {reports.slice(0, 3).map((rep) => (
                      <div key={rep.id} className="bg-[#0b0f17]/20 border border-slate-900/60 p-2 rounded-lg flex items-center justify-between text-xs hover:border-slate-800 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {rep.type === 'Flood' ? '💧' : rep.type === 'Tree Fall' ? '🌳' : rep.type === 'Water Scarcity' ? '🏜️' : '⚠️'}
                          </span>
                          <div className="text-left">
                            <div className="font-semibold text-slate-200 text-[11px] leading-tight">{rep.type}</div>
                            <div className="text-[9px] text-slate-500 mt-0.5 leading-none">{rep.location.split(' (')[0]}</div>
                          </div>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                          rep.status === 'Pending' ? 'bg-red-500/10 border border-red-500/25 text-red-400' :
                          rep.status === 'Verified' ? 'bg-amber-500/10 border border-amber-500/25 text-amber-400' :
                          rep.status === 'Assigned' ? 'bg-blue-500/10 border border-blue-500/25 text-blue-400' :
                          'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
                        }`}>
                          {rep.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="p-4 bg-slate-950/30 hover:bg-slate-900/30 rounded-lg border border-slate-900 hover:border-slate-800 transition-all group flex gap-3.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-all shrink-0">
                  <MapIcon className="text-blue-400 h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-200">GIS Threat Overlays</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Interactive flood boundaries and responder coordinate tracking.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/30 hover:bg-slate-900/30 rounded-lg border border-slate-900 hover:border-slate-800 transition-all group flex gap-3.5">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-all shrink-0">
                  <Brain className="text-purple-400 h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-200">AI Predictive Forecasts</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Lake depth modeling and predictive water shortage limits.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Login/Report Deck */}
          <div className="lg:col-span-5 flex justify-center w-full relative">
            {/* Glow behind login */}
            <div className="absolute inset-0 bg-blue-500/5 rounded-2xl filter blur-3xl pointer-events-none"></div>
            
            <div className="glass-card p-6 rounded-xl w-full max-w-md space-y-5 relative z-10 transition-all border border-white/[0.06]">
              {/* Selector Tabs */}
              <div className="flex border-b border-slate-900/80 mb-4 bg-slate-955/60 p-1 rounded-lg">
                <button 
                  onClick={() => setIntroTab("login")}
                  className={`flex-1 py-2 text-center text-[11px] font-bold rounded-md transition-all ${
                    introTab === 'login' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="inline-block mr-1.5 h-3 w-3" /> Admin Sign-In
                </button>
                <button 
                  onClick={() => setIntroTab("report")}
                  className={`flex-1 py-2 text-center text-[11px] font-bold rounded-md transition-all ${
                    introTab === 'report' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="inline-block mr-1.5 h-3 w-3" /> File Public Report
                </button>
              </div>

              {introTab === "login" ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-white tracking-tight">Sign in to console</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Authorized BBMP personnel access gate</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 block font-semibold">User Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input 
                          type="email" required value={email} onChange={e => setEmail(e.target.value)}
                          placeholder="admin@ecoshield.gov.in" 
                          className="bg-[#0b0f17]/80 border border-slate-800 pl-10 pr-4 py-3 rounded-lg w-full text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 block font-semibold">Security Access Key</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                          <Key className="h-4 w-4" />
                        </span>
                        <input 
                          type="password" required value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="bg-[#0b0f17]/80 border border-slate-800 pl-10 pr-4 py-3 rounded-lg w-full text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all" 
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="text-[11px] bg-red-950/20 border border-red-500/25 p-3 rounded-lg text-red-400 font-medium leading-relaxed flex gap-2 items-start animate-shake">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isDemoConnecting}
                      className={`relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white w-full py-3 rounded-lg font-bold transition-all shadow-lg shadow-blue-600/10 active:scale-[0.98] ${
                        isDemoConnecting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isDemoConnecting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting Security Gate...
                        </span>
                      ) : (
                        "Authenticate System"
                      )}
                    </button>
                  </form>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-900/60"></div>
                    <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">Demo Portal</span>
                    <div className="flex-grow border-t border-slate-900/60"></div>
                  </div>

                  {/* Auto login action button */}
                  <button 
                    onClick={handleDemoLogin}
                    disabled={isDemoConnecting}
                    className="w-full bg-slate-950 hover:bg-slate-900 text-slate-350 hover:text-white border border-slate-900 hover:border-slate-800 py-2.5 rounded-lg text-[11px] font-bold tracking-wide transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <Sparkles className="text-blue-400 group-hover:scale-110 transition-transform h-3.5 w-3.5" />
                    <span>Quick Demo Sign-In (Autofill)</span>
                  </button>

                  {/* Credentials block */}
                  <div className="bg-blue-950/20 border border-blue-900/20 p-3 rounded-lg text-[10px] text-slate-500 leading-relaxed font-mono relative overflow-hidden">
                    <div className="font-bold text-blue-400/90 mb-1 uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                      <Shield className="h-3 w-3 text-blue-450" />
                      Access Credentials:
                    </div>
                    <div>User: <span className="text-slate-350 select-all">admin@ecoshield.gov.in</span></div>
                    <div>Key: <span className="text-slate-350 select-all">admin</span></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div>
                    <h3 className="font-bold text-lg text-white tracking-tight">Public Reporting Intake</h3>
                    <p className="text-xs text-slate-550 mt-0.5">Submit disaster coordinates directly to the grid</p>
                  </div>

                  <form onSubmit={handlePublicReportSubmit} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Your Name</label>
                        <input 
                          type="text" required value={publicName} onChange={e => setPublicName(e.target.value)}
                          placeholder="e.g. Ramesh Patel" 
                          className="bg-[#0b0f17]/80 border border-slate-800 p-2.5 rounded-lg w-full text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Phone Number</label>
                        <input 
                          type="text" value={publicPhone} onChange={e => setPublicPhone(e.target.value)}
                          placeholder="+91 9XXXX XXXXX" 
                          className="bg-[#0b0f17]/80 border border-slate-800 p-2.5 rounded-lg w-full text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Incident Type</label>
                        <select 
                          value={publicType} onChange={e => setPublicType(e.target.value)}
                          className="bg-[#0b0f17]/80 border border-slate-800 p-2.5 rounded-lg w-full text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                        >
                          <option value="Flood">Flood / Waterlogging</option>
                          <option value="Tree Fall">Tree Fall / Blockage</option>
                          <option value="Water Scarcity">Water Depletion</option>
                          <option value="Pollution">Chemical / Lake Foam</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-semibold">Incident Location</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" required value={publicLocation} onChange={e => setPublicLocation(e.target.value)}
                            placeholder="e.g. Silk Board Service Rd" 
                            className="bg-[#0b0f17]/80 border dark:border-slate-800 border-slate-300 p-2.5 rounded-lg w-full dark:text-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                          />
                          <button 
                            type="button"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                            className={`px-3 py-2.5 rounded-lg flex items-center justify-center transition-colors ${
                              isLocating ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
                            }`}
                            title="Get GPS Location"
                          >
                            <MapPin className={`h-5 w-5 ${isLocating ? 'animate-pulse' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Description of Situation</label>
                      <textarea 
                        required rows={3} value={publicDesc} onChange={e => setPublicDesc(e.target.value)}
                        placeholder="Describe waterlogging heights, traffic flow, visual damages..." 
                        className="bg-[#0b0f17]/80 border border-slate-800 p-2.5 rounded-lg w-full text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 resize-none"
                      />
                    </div>

                    {publicSuccess && (
                      <div className="text-[11px] bg-emerald-950/20 border border-emerald-500/25 p-3 rounded-lg text-emerald-400 font-medium leading-relaxed flex gap-2 items-start">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                        <span>{publicSuccess}</span>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-500 text-white w-full py-2.5 rounded-lg font-bold transition shadow-lg shadow-blue-600/10 active:scale-[0.98]"
                    >
                      Submit Emergency Report
                    </button>
                  </form>

                  <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg text-[9px] text-slate-500 leading-relaxed font-mono">
                    <span className="text-red-500 font-bold">WARNING:</span> All submissions are logged, geolocated, and verified by BBMP Disaster Cells. False reporting is subject to prosecution.
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-900/80 bg-slate-950/20 py-4 text-center text-[10px] text-slate-500 font-mono relative z-10">
          EcoShield Intelligence Console | Government of Karnataka Environment Portal
        </footer>
        {renderAiChatAssistant()}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-[#05070c] bg-slate-50 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {renderLiveFeedBanner()}
      
      {/* Top Banner Header */}
      <header className="border-b dark:border-slate-800 border-slate-300 dark:bg-[#070b13] bg-white px-6 py-4 flex items-center justify-between z-10 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 glow-border-cyan">
            <Shield className="text-cyan-400 h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-glow-cyan text-cyan-400 font-display">ECOSHIELD AI</h1>
            <p className="text-[10px] uppercase font-mono tracking-widest dark:text-slate-400 text-slate-500">Climate Resilience Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="hover:text-cyan-400 flex items-center gap-1.5 px-2.5 py-1 rounded dark:bg-[#0b0f17] bg-white border dark:border-slate-800 border-slate-300 cursor-pointer transition-colors"
          >
            {darkMode ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-indigo-400" />}
            <span className="font-mono text-[10px]">{darkMode ? 'LIGHT' : 'DARK'}</span>
          </button>
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded dark:bg-red-950/20 bg-red-100 border dark:border-red-500/30 border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold dark:text-red-500 text-red-600">LIVE FEED</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-mono dark:text-slate-400 text-slate-600">
            <span className="flex items-center gap-2">
              <Wifi className="text-emerald-500 h-4.5 w-4.5" />
              WS: <span className="text-emerald-400 font-semibold">CONNECTED</span>
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {timeString}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <nav className="md:w-64 border-r dark:border-slate-800 border-slate-300 dark:bg-[#070b13] bg-white p-4 flex flex-col gap-1.5 flex-shrink-0 transition-colors">
          <span className="text-[10px] dark:text-slate-500 text-slate-400 font-mono tracking-wider px-3 mb-2 uppercase">Core Platforms</span>
          
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <Activity className="h-4.5 w-4.5" /> Command Dashboard
          </button>

          <button 
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'map' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <MapIcon className="h-4.5 w-4.5" /> GIS Intelligence Map
          </button>

          <button 
            onClick={() => setActiveTab("predictions")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'predictions' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <Brain className="h-4.5 w-4.5" /> AI Prediction Engine
          </button>

          <button 
            onClick={() => setActiveTab("copilot")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'copilot' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <Bot className="h-4.5 w-4.5" /> EcoShield Copilot
          </button>

          <button 
            onClick={() => setActiveTab("environmental")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'environmental' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <Wind className="h-4.5 w-4.5" /> Environmental Track
          </button>

          <span className="text-[10px] dark:text-slate-500 text-slate-400 font-mono tracking-wider px-3 mt-4 mb-2 uppercase">Actions & Ops</span>

          <button 
            onClick={() => setActiveTab("citizen")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'citizen' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <Users className="h-4.5 w-4.5" /> Citizen Reporting
          </button>

          <button 
            onClick={() => setActiveTab("response")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'response' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <Truck className="h-4.5 w-4.5" /> Emergency Response
          </button>

          <button 
            onClick={() => setActiveTab("warnings")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'warnings' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <AlertTriangle className="h-4.5 w-4.5" /> Early Warning System
          </button>

          <span className="text-[10px] text-slate-500 font-mono tracking-wider px-3 mt-4 mb-2 uppercase">Analytics & Admin</span>

          <button 
            onClick={() => setActiveTab("sustainability")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'sustainability' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <Leaf className="h-4.5 w-4.5" /> Sustainability & SDGs
          </button>

          <button 
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'admin' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <Sliders className="h-4.5 w-4.5" /> Admin Control Panel
          </button>

          <button 
            onClick={() => setActiveTab("reporting")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 ${activeTab === 'reporting' ? 'bg-cyan-950/60 text-cyan-400 border-l-4 border-cyan-400 font-semibold' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-slate-800/40 hover:bg-slate-100'}`}>
            <FileText className="h-4.5 w-4.5" /> Export Reports
          </button>

          <button 
            onClick={() => {
              setIsLoggedIn(false);
              setEmail("");
              setPassword("");
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-200 text-red-400 hover:bg-red-950/20 hover:text-red-300 font-semibold mt-auto border border-transparent hover:border-red-900/30"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out Console
          </button>
        </nav>

        {/* Core panel router */}
        <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {activeTab === 'dashboard' && (
            <CommandCenter 
              sensorAqi={sensorAqi} 
              riverLevel={riverLevel} 
              reservoirCapacity={reservoirCapacity} 
              riskIndex={riskIndex} 
              alerts={alerts}
              reports={reports}
              resources={resources}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'map' && (
            <div className="h-[calc(100vh-120px)]">
              <GisMap 
                reports={reports} 
                resources={resources} 
                darkMode={darkMode}
                userLocation={userLocation}
                localResources={localResources}
                mapAction={mapAction}
                floodPolygon={userLocation ? getFloodPolygon(userLocation.lat, userLocation.lng) : []}
                landslideCircles={userLocation ? getLandslideCircles(userLocation.lat, userLocation.lng) : []}
                droughtCircle={userLocation ? getDroughtCircle(userLocation.lat, userLocation.lng) : null}
                sensorAqi={sensorAqi}
                locationHistory={locationHistory}
                distanceTraveled={distanceTraveled}
                currentSpeed={currentSpeed}
                currentDirection={currentDirection}
                followUser={followUser}
                setFollowUser={setFollowUser}
                onlineCount={onlineCount}
                activeTrackedUsers={activeTrackedUsers}
                liveLocationFeed={liveLocationFeed}
                activeBaseMap={activeBaseMap}
                setActiveBaseMap={setActiveBaseMap}
                evacuationPath={evacuationPath}
                geofenceAlert={geofenceAlert}
                setGeofenceAlert={setGeofenceAlert}
                showHeatmap={showHeatmap}
                setShowHeatmap={setShowHeatmap}
                heatmapType={heatmapType}
                setHeatmapType={setHeatmapType}
              />
            </div>
          )}

          {activeTab === 'predictions' && (
            <AiPrediction 
              riverLevel={riverLevel}
            />
          )}

          {activeTab === 'copilot' && (
            <CopilotCenter 
              sensorAqi={sensorAqi} 
              riverLevel={riverLevel} 
              reservoirCapacity={reservoirCapacity} 
              riskIndex={riskIndex} 
              weather={weather}
              resources={resources}
              reports={reports}
              userLocation={userLocation}
            />
          )}

          {activeTab === 'environmental' && (
            <EnvironmentalMonitoring 
              sensorAqi={sensorAqi}
              riverLevel={riverLevel}
              weather={weather}
            />
          )}

          {activeTab === 'citizen' && (
            <CitizenReporting 
              reports={reports}
              onSubmit={addReport}
              onVerify={verifyReport}
              onReject={rejectReport}
            />
          )}

          {activeTab === 'response' && (
            <EmergencyManagement 
              reports={reports}
              resources={resources}
              onDispatch={dispatchResource}
            />
          )}

          {activeTab === 'warnings' && (
            <EarlyWarning 
              onSend={addAlert}
            />
          )}

          {activeTab === 'sustainability' && (
            <SustainabilityAnalytics />
          )}

          {activeTab === 'admin' && (
            <AdminPanel />
          )}

          {activeTab === 'reporting' && (
            <ReportingModule 
              riverLevel={riverLevel}
              sensorAqi={sensorAqi}
              reservoirCapacity={reservoirCapacity}
            />
          )}
        </main>
      </div>
      {renderAiChatAssistant()}
    </div>
  );
}
  
