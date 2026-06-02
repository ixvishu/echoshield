import { GoogleGenerativeAI } from '@google/generative-ai';
import React, { useState, useEffect } from 'react';
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

  const handleSendMessage = async (text: string) => {
    if (isTyping) return;
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const userMsg = { sender: 'user' as const, text, time: timeStr };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);
    
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        systemInstruction: "You are the EcoShield AI Assistant. You specialize in providing emergency guidance, climate resilience updates, and disaster management protocols for all of India. Provide brief, concise, and helpful answers."
      });
      const result = await model.generateContent(text);
      const aiText = result.response.text();
      const aiMsg = { sender: 'ai' as const, text: aiText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const fallbackText = "I'm having trouble connecting to the live neural network right now. Please check if the API key is valid or try again.";
      const aiMsg = { sender: 'ai' as const, text: fallbackText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
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
              {!geminiKey ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                  <Lock className="h-8 w-8 text-slate-500 mb-3" />
                  <h3 className="text-slate-300 font-bold mb-2">API Key Required</h3>
                  <p className="text-slate-500 text-[10px] mb-4">To use the live AI model, enter your Google Gemini API Key.</p>
                  <input 
                    type="password"
                    placeholder="Paste API Key here..."
                    className="bg-slate-900 border border-slate-700 rounded p-2 text-xs w-full text-white mb-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value;
                        if (val) {
                          localStorage.setItem('gemini_key', val);
                          setGeminiKey(val);
                        }
                      }
                    }}
                  />
                  <p className="text-[8px] text-slate-600">Press Enter to save. Stored securely in your browser.</p>
                </div>
              ) : (
                <>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-2.5 rounded-lg leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-blue-600/90 text-white rounded-br-none text-right' 
                          : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-bl-none text-left'
                      }`}>
                        <div>{msg.text}</div>
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
                </>
              )}
            </div>

            {/* Quick Prompts Starter Chips */}
            {geminiKey && chatMessages.length === 1 && (
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
            {geminiKey && (
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
            )}
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
              <GisMap reports={reports} resources={resources} darkMode={darkMode} />
            </div>
          )}

          {activeTab === 'predictions' && (
            <AiPrediction 
              riverLevel={riverLevel}
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
}  const handleGetLocation = () => {
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

const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_key') || '');
  
