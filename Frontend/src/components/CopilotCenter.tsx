import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  FileText, 
  Rss, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  AlertTriangle, 
  PieChart, 
  Activity, 
  FileCode,
  Shield,
  Zap,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface CopilotProps {
  sensorAqi: number;
  riverLevel: number;
  reservoirCapacity: number;
  riskIndex: number;
  weather: {
    temp: number;
    hum: number;
    wind: number;
    rain: number;
  };
  resources: any[];
  reports: any[];
  userLocation: {
    lat: number;
    lng: number;
    district: string;
    city: string;
    state: string;
  } | null;
}

interface AgentLog {
  name: string;
  log: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface ScannedIncident {
  type: string;
  severity: string;
  priority: string;
  confidence: string;
  description: string;
}

export default function CopilotCenter({
  sensorAqi,
  riverLevel,
  reservoirCapacity,
  riskIndex,
  weather,
  resources,
  reports,
  userLocation
}: CopilotProps) {
  // State variables
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [proactiveInsights, setProactiveInsights] = useState<string[]>([
    "Flood risk in Bellandur Basin increased by 12% due to inflow.",
    "Reservoir capacity at TG Halli is holding stable at 28.5%.",
    "AQI monitoring stations in Peenya report normal index fluctuations."
  ]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hello! I am EcoShield's AI Resilience Assistant. How can I help you coordinate district environmental updates today?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [speechListening, setSpeechListening] = useState(false);
  const [speakBack, setSpeakBack] = useState(false);
  const [scannedIncident, setScannedIncident] = useState<ScannedIncident | null>(null);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [alertSms, setAlertSms] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertPush, setAlertPush] = useState("");
  const [selectedScanMock, setSelectedScanMock] = useState("");

  // Periodic proactive feed simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(10 + Math.random() * 15);
      const areas = ["Bengaluru Rural", "Whitefield Sector 4", "Peenya Industrial Grid", "Koramangala Basin"];
      const selectedArea = areas[Math.floor(Math.random() * areas.length)];
      
      const simulatedFeeds = [
        `📊 Proactive Risk Index: Calculated risk factors increased by ${delta}% at ${selectedArea}`,
        `💧 Hydro Alert: Regional sensor readings fluctuate around critical thresholds.`,
        `⚠️ Environmental Notice: Meteorological parameters adjusted due to rainfall: ${weather.rain}mm.`
      ];
      const selectedFeed = simulatedFeeds[Math.floor(Math.random() * simulatedFeeds.length)];
      setProactiveInsights(p => [selectedFeed, ...p.slice(0, 8)]);
    }, 10000);

    return () => clearInterval(interval);
  }, [weather.rain]);

  // STT Handlers
  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setSpeechListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setSpeechListening(false);
    };

    recognition.onend = () => {
      setSpeechListening(false);
    };

    recognition.start();
  };

  // Copilot message sending & Agent simulation
  const handleCopilotSend = (e: React.FormEvent | null, customText?: string) => {
    if (e) e.preventDefault();
    const queryText = customText || chatInput;
    if (!queryText.trim()) return;

    setChatInput("");
    const userMsg: ChatMessage = {
      sender: "user",
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setAgentLogs([]);

    const agents = [
      { name: "Flood & Reservoir Agent", log: `Analyzing Bellandur Lake telemetry (${riverLevel}m) and TG Halli reservoir (${reservoirCapacity.toFixed(1)}%). Runoff model: ACTIVE.` },
      { name: "Rainfall & Heatwave Agent", log: `Correlating regional weather. Temp: ${weather.temp}°C, Precipitation: ${weather.rain}mm. Status: NOMINAL.` },
      { name: "Resource Dispatch Agent", log: `Scanning emergency responder telemetry. Active resource units: ${resources.length}. All teams standby.` },
      { name: "GIS Map Overlay Agent", log: `Computing escape vectors and safe shelters nearby. Evacuation bypass route verified.` },
      { name: "AQI & Pollution Agent", log: `Retrieving Peenya AQI data: ${sensorAqi} PM2.5. Status: ${sensorAqi > 200 ? 'UNHEALTHY' : 'MODERATE'}.` },
      { name: "Tree Cover & SDG Agent", log: "Assessing urban canopy density for slope stability. Soil saturation: 62%." },
      { name: "PDF Report Agent", log: "Formatting command briefing summary template. Awaiting compilation signal." }
    ];

    let index = 0;
    const pushAgentLog = () => {
      if (index < agents.length) {
        setAgentLogs(prev => [...prev, agents[index]]);
        index++;
        setTimeout(pushAgentLog, 300);
      } else {
        setTimeout(() => {
          const query = queryText.toLowerCase();
          let aiText = "";

          if (query.includes("where am i")) {
            if (userLocation) {
              aiText = `You are currently situated in the **${userLocation.district}** district of **${userLocation.city}**, ${userLocation.state}. Current GPS lock is at **Lat: ${userLocation.lat.toFixed(5)}, Lng: ${userLocation.lng.toFixed(5)}**. The local risk index is calculated at **${riskIndex}%**.`;
            } else {
              aiText = "Awaiting GPS lock to resolve your exact district location coordinates.";
            }
          } else if (query.includes("flood zone") || query.includes("am i in danger")) {
            if (userLocation) {
              const insideFlood = userLocation.district === "Koramangala" || riverLevel > 12.8;
              if (insideFlood) {
                aiText = `🚨 **CRITICAL WARNING:** Your location in **${userLocation.district}** lies within an active **FLOOD HIERARCHY OVERLAY GEOFENCE**. Current river level telemetry is **${riverLevel}m** (exceeding critical threshold). Safe route navigation has been computed. Recommend immediate evacuation.`;
              } else {
                aiText = `✅ **STATUS SAFE:** Your geolocated coordinates at **${userLocation.district}** are outside the active flood overlay boundaries. However, local river sensors report **${riverLevel}m**, and the general district risk is **${riskIndex}%**.`;
              }
            } else {
              aiText = "Could not resolve GPS location to compute flood hazard overlays.";
            }
          } else if (query.includes("shelter")) {
            if (userLocation) {
              const nearestShelter = resources.find(r => r.type.toLowerCase().includes('shelter'));
              if (nearestShelter) {
                aiText = `🏠 The nearest emergency disaster shelter is **${nearestShelter.name}** located in **${nearestShelter.location}**. Emergency Hotline: **${nearestShelter.contact || '+91 80 2297 5000'}**. Safe route overlay marked.`;
              } else {
                aiText = "No relief shelters found within operational parameters.";
              }
            } else {
              aiText = "Unable to compute nearest shelter coordinates without active user GPS lock.";
            }
          } else if (query.includes("hospital")) {
            const nearestH = resources.find(r => r.type.toLowerCase().includes('hospital')) || resources.find(r => r.type.toLowerCase().includes('ambulance'));
            if (nearestH) {
              aiText = `🏥 The nearest medical station is **${nearestH.name}** (${nearestH.contact || 'EWS Line'}) located in ${nearestH.location}. Dispatched medical squads are on standby.`;
            } else {
              aiText = "GPS coordinates required to locate nearest medical center.";
            }
          } else {
            aiText = `Copilot Command Center successfully ingested query: "${queryText}". Inter-agent logs verified. Telemetry states: AQI ${sensorAqi}, Water Level ${riverLevel}m, Reservoir Capacity ${reservoirCapacity.toFixed(1)}%, Risk Index ${riskIndex}%. All systems functional.`;
          }

          if (speakBack && window.speechSynthesis) {
            const speechMsg = new SpeechSynthesisUtterance(aiText.replace(/[*#`🚨✅]/g, ''));
            window.speechSynthesis.speak(speechMsg);
          }

          const aiMsg: ChatMessage = {
            sender: "ai",
            text: aiText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatMessages(prev => [...prev, aiMsg]);
          setIsTyping(false);
        }, 500);
      }
    };

    pushAgentLog();
  };

  const generateExecutiveBriefing = () => {
    const timeStr = new Date().toLocaleString();
    const pendingCount = reports.filter(r => r.status === 'Pending').length;
    const brief = `
========================================
ECOSHIELD EMERGENCY SITUATION BRIEFING
========================================
Generated: ${timeStr}
Classification: EXECUTIVE DISASTER INTEL
Sector: Bengaluru Metropolitan Region

1. REGIONAL HYDROLOGY STATUS:
- Bellandur Basin Level: ${riverLevel} meters (Threshold: 12.8m)
- Status: ${riverLevel > 12.8 ? 'CRITICAL FLOOD STAGE' : 'STABLE'}
- TG Halli Capacity: ${reservoirCapacity.toFixed(1)}% (Threshold: 20%)
- Status: ${reservoirCapacity < 20 ? 'CRITICAL SCARCITY ALERT' : 'ADEQUATE'}

2. ENVIRONMENTAL QUALITY:
- Peenya Grid AQI: ${sensorAqi} PM2.5
- Status: ${sensorAqi > 200 ? 'UNHEALTHY ENVIRONMENT WARNING' : 'MODERATE/GOOD'}

3. OPERATIONS SUMMARY:
- Deployed Relief/Rescue Units: ${resources.length} active nodes
- Active Public Incident Reports: ${reports.length} total logged
- Pending BBMP Verification Queue: ${pendingCount} incidents

4. PREDICTIVE INSIGHTS FEED:
- Local Risk Index: ${riskIndex}%
- Weather Matrix: Temp: ${weather.temp}°C, Humidity: ${weather.hum}%, Rain: ${weather.rain}mm

RECOMMENDED ACTION PLAN:
${riverLevel > 12.8 ? '-> Deploy emergency pump squads to Outer Ring Road.\n-> Issue push warnings for low-lying regions.' : ''}
${sensorAqi > 200 ? '-> Halt industrial production in Peenya grid.\n-> Advise mask wear and filter activation.' : ''}
-> Verify pending citizen alerts to prioritize resources.
    `.trim();
    setBriefingText(brief);
  };

  const scanMockImage = (type: string) => {
    if (!type) return;
    setIsScanningImage(true);
    setScannedIncident(null);
    setSelectedScanMock(type);

    setTimeout(() => {
      let severity = "Medium";
      let priority = "P3";
      let confidence = "92.4%";
      let description = "";

      if (type === "Flood") {
        severity = "Critical";
        priority = "P1";
        confidence = "98.1%";
        description = "Severe waterlogging obstructing arterial transit routing. Depth estimated at 1.2m.";
      } else if (type === "Fire") {
        severity = "Critical";
        priority = "P1";
        confidence = "99.4%";
        description = "High-temperature thermal hazard detected in dry foliage zones. High rate of spread.";
      } else if (type === "Landslide") {
        severity = "High";
        priority = "P2";
        confidence = "94.6%";
        description = "Debris movement blocking road. Slope safety safety margin degraded by saturation.";
      } else if (type === "Pollution") {
        severity = "High";
        priority = "P2";
        confidence = "91.8%";
        description = "Industrial wastewater discharged into lake buffer channels. Chemical foam detected.";
      } else if (type === "Water Leak") {
        severity = "Medium";
        priority = "P3";
        confidence = "89.2%";
        description = "Municipal water pipeline rupture. Secondary street erosion risk identified.";
      } else if (type === "Tree Fall") {
        severity = "Low";
        priority = "P3";
        confidence = "96.5%";
        description = "Tree canopy obstructing secondary street lanes. No electrical line contact.";
      }

      setScannedIncident({
        type,
        severity,
        priority,
        confidence,
        description
      });
      setIsScanningImage(false);
    }, 1500);
  };

  const generateAlertTemplates = (type: string, area?: string | null) => {
    const hazardArea = area || (userLocation ? userLocation.district : "Whitefield Sector 4");
    
    setAlertSms(`ALERT: A critical ${type.toUpperCase()} incident has been identified at ${hazardArea}. Rescue squads dispatched. Evacuate immediately. - EcoShield EWS`);
    
    setAlertEmail(`Subject: CRITICAL DISASTER BROADCAST - ${type.toUpperCase()} - ${hazardArea}
    
Dear Resident,

The EcoShield AI Copilot has registered a high-priority ${type} incident in your immediate sector (${hazardArea}). 
Active telemetry indicates safety margins are compromised.

- Incident Level: High/Critical
- Coordinates & Route: Refer to the live GIS Map dashboard.
- Recommended Action: Follow designated evacuation paths to safe shelters.

Stay safe,
EcoShield Control Board`);

    setAlertPush(`⚠️ Disaster Warning: ${type} alert issued in ${hazardArea}. View safe routing paths immediately.`);
  };

  const triggerPdfPrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const pendingCount = reports.filter(r => r.status === 'Pending').length;
    const timeStr = new Date().toLocaleString();

    printWindow.document.write(`
      <html>
        <head>
          <title>EcoShield Disaster Briefing Report</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; background-color: #ffffff; color: #000000; padding: 40px; line-height: 1.4; }
            h1 { border-bottom: 2px double #000000; padding-bottom: 5px; text-align: center; }
            .meta { margin-bottom: 20px; font-weight: bold; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: bold; text-transform: uppercase; text-decoration: underline; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 50px; font-size: 10px; text-align: center; border-top: 1px solid #000000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>ECOSHIELD AI DISASTER INTELLIGENCE BRIEF</h1>
          <div class="meta">
            <div>REPORT TIMESTAMP: ${timeStr}</div>
            <div>CLASSIFICATION: RESTRICTED OFFICE LEVEL</div>
            <div>TARGET SECTOR: BENGALURU OPERATIONAL DIVISION</div>
          </div>
          
          <div class="section">
            <div class="section-title">1. Telemetry State Readings</div>
            <table>
              <tr><th>Sensor Station</th><th>Current Reading</th><th>Status</th></tr>
              <tr><td>Bellandur Basin River Sensor</td><td>${riverLevel} meters</td><td>${riverLevel > 12.8 ? 'CRITICAL (HIGH)' : 'STABLE'}</td></tr>
              <tr><td>TG Halli Reservoir Station</td><td>${reservoirCapacity.toFixed(1)}%</td><td>${reservoirCapacity < 20 ? 'CRITICAL (LOW)' : 'ADEQUATE'}</td></tr>
              <tr><td>Peenya Industrial Air Grid</td><td>${sensorAqi} PM2.5</td><td>${sensorAqi > 200 ? 'UNHEALTHY' : 'MODERATE/GOOD'}</td></tr>
              <tr><td>Calculated District Risk Index</td><td>${riskIndex}%</td><td>${riskIndex > 60 ? 'HIGH WARNING' : 'MODERATE'}</td></tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">2. Resource & Incidents Inventory</div>
            <ul>
              <li>Standby Emergency Responders: ${resources.length} units</li>
              <li>Total Citizens Logged Incidents: ${reports.length} entries</li>
              <li>Pending Verification Queue Count: ${pendingCount} reports</li>
            </ul>
          </div>

          <div class="section">
            <div class="section-title">3. Action items & Advisories</div>
            <p>Telemetry checks show ${riverLevel > 12.8 ? 'active river flooding on ORR' : 'river level within boundaries'}. Peenya AQI registers ${sensorAqi > 200 ? 'unhealthy industrial particulate matters' : 'nominal safety margins'}. All field units are requested to verify pending citizen notifications and optimize routing paths.</p>
          </div>

          <div class="footer">
            EcoShield AI Platform &copy; 2026 - Generated under secure audit token.
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bot className="text-cyan-400 h-6 w-6 animate-pulse" /> EcoShield Copilot Command Center
          </h2>
          <p className="text-slate-400 text-sm">Disaster Intelligence Officer, GIS Coordinator & Environmental Analyst</p>
        </div>
        <div className="flex gap-2 text-xs font-mono">
          <button 
            onClick={triggerPdfPrint}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3 py-2 rounded transition flex items-center gap-2"
          >
            <FileText className="text-red-400 h-4 w-4" /> Export PDF Audit
          </button>
          <button 
            onClick={generateExecutiveBriefing}
            className="bg-cyan-600 hover:bg-cyan-550 text-white px-3 py-2 rounded transition flex items-center gap-2 shadow-lg shadow-cyan-500/10"
          >
            <FileCheck className="h-4 w-4" /> Run Executive Briefing
          </button>
        </div>
      </div>

      {/* Top Grid: Briefing Desk and Live AI Insights Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Situation Briefing Desk */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-lg flex flex-col justify-between min-h-[250px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <FileCode className="text-cyan-400 h-4.5 w-4.5" /> Executive Briefing Desk
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-750 text-slate-400 rounded font-mono">Live Sync</span>
            </div>
            {briefingText ? (
              <pre className="bg-black/40 border border-slate-850 p-4 rounded font-mono text-xs text-slate-200 overflow-auto max-h-[160px] scrollbar-thin whitespace-pre-wrap">
                {briefingText}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-[140px] text-center text-slate-500 italic border border-dashed border-slate-800 rounded-lg bg-slate-900/10">
                <Bot className="text-slate-700 h-10 w-10 mb-2" />
                <span className="text-xs font-mono">Click "Run Executive Briefing" above to generate a full operational brief.</span>
              </div>
            )}
          </div>
        </div>

        {/* Proactive AI Insights Feed */}
        <div className="glass-panel p-5 rounded-lg flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Rss className="text-orange-400 h-4.5 w-4.5 animate-pulse" /> Proactive AI Insights Feed
            </h3>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-2 max-h-[170px]">
            {proactiveInsights.map((insight, idx) => (
              <div key={idx} className="p-3 rounded bg-slate-900/40 border border-slate-850 text-xs font-mono leading-relaxed text-slate-200 flex gap-2">
                <TrendingUp className="text-cyan-400 h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Grid: Multi-Agent Collaborator and Chat Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Agent Collaborator */}
        <div className="glass-panel p-5 rounded-lg flex flex-col justify-between h-[390px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Shield className="text-cyan-400 h-4.5 w-4.5" /> Multi-Agent Command Matrix
              </h3>
              <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">7 Active</span>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-[250px] pr-1 scrollbar-thin">
              {[
                { name: "Flood & Reservoir Agent", icon: "fa-water", desc: "Monitors lake gauges & water levels" },
                { name: "Rainfall & Heatwave Agent", icon: "fa-cloud-showers-heavy", desc: "Correlates weather radar & humidity" },
                { name: "Resource Dispatch Agent", icon: "fa-truck-medical", desc: "Coordinates emergency standby squads" },
                { name: "GIS Map Overlay Agent", icon: "fa-layer-group", desc: "Draws safe boundaries & bypass routes" },
                { name: "AQI & Pollution Agent", icon: "fa-wind", desc: "Tracks PM2.5 and environmental particles" },
                { name: "Tree Cover & SDG Agent", icon: "fa-leaf", desc: "Assesses landslide risks & green grids" },
                { name: "PDF Report Agent", icon: "fa-file-export", desc: "Assembles briefing metrics & print jobs" }
              ].map((agent, i) => {
                const matchedLog = agentLogs.find(log => log.name === agent.name);
                return (
                  <div key={i} className="p-2.5 rounded bg-slate-950/40 border border-slate-900 text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <div className="flex items-center gap-1.5 font-bold text-slate-300">
                        <i className={`fa-solid ${agent.icon} w-3.5 text-cyan-400`}></i>
                        <span>{agent.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-mono">{matchedLog ? 'ACTIVE' : 'STANDBY'}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${matchedLog ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)] animate-pulse' : 'bg-slate-650'}`}></span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {matchedLog ? (
                        <span className="text-cyan-300 italic font-mono">{matchedLog.log}</span>
                      ) : (
                        <span>{agent.desc}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-2 mt-2">
            Collaborative reasoning delay: 300ms/agent.
          </div>
        </div>

        {/* Copilot Chat Console */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-lg flex flex-col justify-between h-[390px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Bot className="text-cyan-400 h-4.5 w-4.5" /> Copilot Officer Chat
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1 cursor-pointer font-mono text-slate-400">
                <input 
                  type="checkbox" 
                  checked={speakBack} 
                  onChange={e => setSpeakBack(e.target.checked)} 
                  className="accent-cyan-400 cursor-pointer"
                />
                <span>Audio Read-out</span>
              </label>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-3 p-1 max-h-[250px]">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                  msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-850 border border-slate-700 text-cyan-400'
                }`}>
                  {msg.sender === 'user' ? 'U' : 'AI'}
                </div>
                <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'bg-indigo-650/40 text-slate-100 border border-indigo-500/20' : 'bg-slate-900/60 text-slate-300 border border-slate-800'
                }`} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}></div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="h-8 w-8 rounded-full bg-slate-850 border border-slate-700 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <div className="p-3 rounded-lg text-xs bg-slate-900/60 text-slate-400 border border-slate-800 flex items-center gap-1 font-mono italic">
                  <i className="fa-solid fa-spinner animate-spin"></i> Coordinating agent thoughts...
                </div>
              </div>
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleCopilotSend} className="flex gap-2 border-t border-slate-800 pt-3 mt-2">
            <button 
              type="button"
              onClick={startVoiceInput}
              className={`p-3 rounded-lg transition cursor-pointer flex items-center justify-center border ${
                speechListening 
                  ? 'bg-red-900 border-red-500 text-white animate-pulse' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Record Voice Query (STT)"
            >
              {speechListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>
            <input 
              type="text" 
              placeholder='Ask "Am I in danger?", "Where am I?", "Show nearest shelter"...'
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg text-xs p-3 focus:outline-none focus:border-cyan-500 text-slate-200"
            />
            <button 
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-550 text-white px-5 rounded-lg text-xs font-mono font-bold transition cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" /> Execute
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Grid: Mock Scanner and Alerts Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Scanner Card */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-lg flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Camera className="text-cyan-400 h-4.5 w-4.5" /> AI Vision Incident Scanner
              </h3>
              <span className="text-[10px] font-mono text-slate-500">MOCK IMAGES</span>
            </div>

            {/* Scanner Selector Buttons */}
            <div className="grid grid-cols-3 gap-1.5 mb-3 text-[10px] font-mono">
              {["Flood", "Fire", "Landslide", "Pollution", "Water Leak", "Tree Fall"].map((type, idx) => (
                <button
                  key={idx}
                  onClick={() => scanMockImage(type)}
                  className={`py-1.5 rounded border transition cursor-pointer text-center ${
                    selectedScanMock === type
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-650'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Scan Viewbox */}
            {isScanningImage ? (
              <div className="h-[120px] rounded-lg border border-slate-800 bg-slate-950/60 relative overflow-hidden flex flex-col items-center justify-center text-xs text-cyan-400 font-mono">
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-pulse pointer-events-none"></div>
                <Zap className="h-5 w-5 animate-bounce mb-1.5" />
                <span>Scanning upload payload...</span>
              </div>
            ) : scannedIncident ? (
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-850 text-[10px] font-mono space-y-1.5 h-[120px] overflow-y-auto scrollbar-thin">
                <div className="flex justify-between border-b border-slate-900 pb-1 font-bold">
                  <span className="text-cyan-400">{scannedIncident.type.toUpperCase()} HAZARD</span>
                  <span className="text-emerald-450">{scannedIncident.confidence} Match</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                  <div>Severity: <span className="text-white font-bold">{scannedIncident.severity}</span></div>
                  <div>Priority: <span className="text-white font-bold">{scannedIncident.priority}</span></div>
                </div>
                <p className="text-[10px] text-slate-350 leading-normal italic">"{scannedIncident.description}"</p>
                <button 
                  onClick={() => generateAlertTemplates(scannedIncident.type, null)}
                  className="w-full mt-2 py-1 text-[9px] bg-indigo-650 hover:bg-indigo-600 text-white rounded transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Stage Broadcast Templates
                </button>
              </div>
            ) : (
              <div className="h-[120px] rounded-lg border border-dashed border-slate-800 flex flex-col items-center justify-center text-center text-slate-500 italic font-mono text-[10px] p-4 bg-slate-900/5">
                <Camera className="h-8 w-8 text-slate-700 mb-1.5" />
                <span>Select an incident tag above to run mock visual intelligence diagnosis.</span>
              </div>
            )}
          </div>
          
          <div className="text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-2">
            Simulated neural nets classify hazards instantly.
          </div>
        </div>

        {/* Risk Breakdowns & Alerts Card */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-lg flex flex-col justify-between h-[360px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* Explainable AI */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300 font-mono border-b border-slate-800 pb-1.5 flex items-center gap-2">
                <PieChart className="text-cyan-400 h-4.5 w-4.5" /> Explainable AI Indicators
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-[10px] text-slate-400">
                    <span>Rainfall Runoff Factor</span>
                    <span>45% Impact</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-[10px] text-slate-400">
                    <span>Reservoir Depletion Level</span>
                    <span>35% Impact</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full"><div className="bg-amber-600 h-1.5 rounded-full" style={{ width: '35%' }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-[10px] text-slate-400">
                    <span>Soil Saturation Rate</span>
                    <span>20% Impact</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full"><div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '20%' }}></div></div>
                </div>
              </div>
              
              {/* 72h Timeline */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">72-Hour Predictions</span>
                <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-mono">
                  <div className="p-1.5 rounded bg-slate-900/60 border border-slate-850">
                    <div className="text-slate-500">Day 1</div>
                    <div className="font-bold text-cyan-400">58% Risk</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/60 border border-slate-850">
                    <div className="text-slate-500">Day 2</div>
                    <div className="font-bold text-amber-500">62% Risk</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-900/60 border border-slate-850">
                    <div className="text-slate-500">Day 3</div>
                    <div className="font-bold text-emerald-400">42% Risk</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configurable Alert Generators */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-300 font-mono border-b border-slate-800 pb-1.5 flex items-center gap-2">
                  <AlertTriangle className="text-indigo-400 h-4.5 w-4.5" /> Broadcast alert templates
                </h3>
                {alertSms ? (
                  <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin text-[9px] font-mono text-slate-300">
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-900">
                      <div className="text-[8px] text-indigo-400 font-bold mb-0.5">SMS CHANNEL</div>
                      <p>{alertSms}</p>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-900">
                      <div className="text-[8px] text-indigo-400 font-bold mb-0.5">EMAIL BROADCAST</div>
                      <p className="whitespace-pre-line">{alertEmail}</p>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-900">
                      <div className="text-[8px] text-indigo-400 font-bold mb-0.5">MOBILE PUSH NOTIFICATION</div>
                      <p>{alertPush}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[140px] text-center text-slate-500 italic font-mono text-[10px] border border-dashed border-slate-800 rounded-lg bg-slate-900/5">
                    <AlertTriangle className="h-8 w-8 text-slate-700 mb-1.5" />
                    <span>No templates generated yet. Scan an incident on the left or select custom alerts.</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => generateAlertTemplates("Flood", "Outer Ring Road")}
                  className="flex-1 py-1.5 text-[10px] border border-slate-850 bg-slate-800/80 hover:bg-slate-850 text-slate-350 rounded font-mono transition cursor-pointer"
                >
                  Preset: ORR Flood
                </button>
                <button
                  type="button"
                  onClick={() => generateAlertTemplates("Pollution", "Peenya Grid")}
                  className="flex-1 py-1.5 text-[10px] border border-slate-850 bg-slate-800/80 hover:bg-slate-850 text-slate-350 rounded font-mono transition cursor-pointer"
                >
                  Preset: Peenya AQI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
