import React, { useState } from 'react';
import { AlertTriangle, MessageSquare, Smartphone, Mail, ShieldAlert } from 'lucide-react';

interface EarlyWarningProps {
  onSend: (text: string, type: 'danger' | 'warning' | 'info') => void;
}

export default function EarlyWarning({ onSend }: EarlyWarningProps) {
  const [type, setType] = useState("Flood Warning");
  const [district, setDistrict] = useState("Bangalore East");
  const [severity, setSeverity] = useState("Critical");
  const [message, setMessage] = useState("ALERT: Heavy discharge from upstream reservoirs. Bellandur level rising. Evacuate low-lying areas immediately. Call 108 for help.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    onSend(`BROADCAST: ${severity} ${type} sent to ${district}.`, severity === 'Critical' ? 'danger' : 'warning');
    alert(`Emergency broadcast sent successfully to ${district}!`);
  };

  const handleTypeChange = (val: string) => {
    setType(val);
    if (val.includes("Heatwave")) {
      setMessage("ALERT: Heatwave Advisory! Temperatures are expected to exceed 43°C. Avoid outdoor exposure between 11 AM and 4 PM. Stay hydrated.");
    } else if (val.includes("Cyclone")) {
      setMessage("CRITICAL CYCLONE ALERT: Gusts up to 120km/h expected in the next 12 hours. Fishermen remain at port. Evacuate to concrete shelters.");
    } else if (val.includes("Pollution")) {
      setMessage("WARNING: Air pollution index has exceeded critical limits. Children and elderly should remain indoors. Mask advisories active.");
    } else {
      setMessage("ALERT: Heavy discharge from upstream reservoirs. Bellandur level rising. Evacuate low-lying areas immediately. Call 108 for help.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <AlertTriangle className="text-cyan-400 h-6 w-6" /> Early Warning System (EWS)
        </h2>
        <p className="text-slate-400 text-sm">Draft, approve, and broadcast regional warnings across multi-channel telecommunications networks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CONFIG PORTAL */}
        <div className="glass-panel p-5 rounded-lg space-y-4 lg:col-span-1 h-fit">
          <h3 className="text-md font-bold border-b border-slate-800 pb-2 flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-4.5 w-4.5" /> Broadcast Builder
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Warning Type</label>
              <select 
                value={type} onChange={e => handleTypeChange(e.target.value)}
                className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-slate-200 focus:outline-none"
              >
                <option>Flood Warning</option>
                <option>Heatwave Warning</option>
                <option>Cyclone Warning</option>
                <option>Air Pollution Warning</option>
                <option>Water Scarcity Warning</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Target District</label>
              <select 
                value={district} onChange={e => setDistrict(e.target.value)}
                className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-slate-200 focus:outline-none"
              >
                <option>Bangalore East</option>
                <option>Bangalore West</option>
                <option>Whitefield Region</option>
                <option>Industrial Sector</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Severity</label>
              <select 
                value={severity} onChange={e => setSeverity(e.target.value)}
                className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-slate-200 focus:outline-none"
              >
                <option>Critical</option>
                <option>Moderate</option>
                <option>Advisory</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Message Payload</label>
              <textarea 
                value={message} onChange={e => setMessage(e.target.value)}
                rows={4} className="bg-slate-950 border border-slate-800 p-2 rounded w-full text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button type="submit" className="bg-red-650 hover:bg-red-600 text-white w-full py-2.5 rounded font-bold transition">
              Broadcast Warnings
            </button>
          </form>
        </div>

        {/* MOCKUP PREVIEWS */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SMS Preview */}
            <div className="glass-panel p-4 rounded-lg flex flex-col justify-between">
              <span className="text-xs text-slate-400 uppercase font-mono mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-cyan-400" /> SMS Broadcast Preview
              </span>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg relative min-h-[140px] text-xs">
                <div className="font-bold border-b border-slate-900 pb-1 mb-2 text-[10px] text-slate-500 font-mono">TO: 98,200 CELL PHONES</div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-slate-100 italic leading-relaxed">
                  "{message}"
                </div>
              </div>
            </div>

            {/* Push Notification Preview */}
            <div className="glass-panel p-4 rounded-lg flex flex-col justify-between">
              <span className="text-xs text-slate-400 uppercase font-mono mb-2 flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-cyan-400" /> Push Alert Notification
              </span>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex items-center justify-center min-h-[140px]">
                <div className="w-full bg-slate-800/90 border border-slate-700/80 p-3 rounded shadow-lg max-w-[260px] text-xs space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <ShieldAlert className="text-cyan-400 h-3.5 w-3.5" /> ECOSHIELD AI
                  </div>
                  <div className="font-bold text-white text-[11px] uppercase">{severity} {type}</div>
                  <p className="text-[10px] text-slate-300 leading-snug line-clamp-2">{message}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="glass-panel p-4 rounded-lg">
            <span className="text-xs text-slate-400 uppercase font-mono mb-2 flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-cyan-400" /> Email Advisory Template
            </span>
            <div className="bg-[#0f172a] border border-slate-800 p-6 rounded text-xs space-y-4 text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-cyan-455 font-display">ECOSHIELD PLATFORM</span>
                <span className="text-[9px] text-slate-500 font-mono">GOVERNMENT BROADCAST</span>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">Subject: Emergency Alert Advisory - {district} (Critical Alert)</h4>
                <p>This is an automated hazard warning issued from District Command Center. Local safety thresholds have been exceeded:</p>
                <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-200 italic rounded">
                  "{message}"
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Please adhere to regional evacuation instructions. Call emergency helpline 108 if in immediate danger.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
