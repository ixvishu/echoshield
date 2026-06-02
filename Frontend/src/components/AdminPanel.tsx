import React from 'react';
import { Sliders, Database, Shield, ShieldAlert, Cpu } from 'lucide-react';

export default function AdminPanel() {
  
  const sensors = [
    { id: "NODE-S401", location: "Bellandur River Bridge", type: "Depth Acoustic", status: "ONLINE", battery: "94%" },
    { id: "NODE-S402", location: "District Collector Office", type: "PM2.5 Sensor", status: "ONLINE", battery: "88%" },
    { id: "NODE-S403", location: "Whitefield Canal Outlet", type: "Pressure Flow", status: "ONLINE", battery: "91%" },
    { id: "NODE-S404", location: "Supaul Border Station", type: "Wind Anemometer", status: "MAINTENANCE", battery: "42%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sliders className="text-cyan-400 h-6 w-6" /> Admin Control Deck
        </h2>
        <p className="text-slate-400 text-sm">Configure telemetry sensor alerts, check DB health, and adjust threshold parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SENSOR HEALTH MAP */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-md font-bold border-b border-slate-800 pb-2 flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-cyan-400" /> Sensor Grid Diagnostics
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {sensors.map(node => (
              <div key={node.id} className="bg-slate-900/60 border border-slate-800 p-3.5 rounded flex flex-col justify-between gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-200 font-mono">{node.id}</span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{node.location}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] ${
                    node.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-450' : 'bg-amber-950 text-amber-400'
                  }`}>{node.status}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-2">
                  <span>Sensor: {node.type}</span>
                  <span>Power: {node.battery}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTROLS AND SYSTEM CONFIGS */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-md font-bold border-b border-slate-800 pb-2 flex items-center gap-2 text-cyan-400">
            <Shield className="h-4.5 w-4.5" /> System Controls
          </h3>
          
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded border border-slate-850">
              <span className="font-medium">Websocket telemetry push:</span>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono px-2.5 py-1 rounded">ACTIVE</button>
            </div>

            <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded border border-slate-850">
              <span className="font-medium">Predictive model interval:</span>
              <span className="text-cyan-400 font-mono font-semibold">Every 4 Hours</span>
            </div>

            <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded border border-slate-850">
              <span className="font-medium">Database Node:</span>
              <span className="text-slate-400 font-mono flex items-center gap-1">
                <Database className="h-3.5 w-3.5" /> Postgres+PostGIS
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded border border-slate-850">
              <span className="font-medium">Citizen API Gateway:</span>
              <span className="text-emerald-400 font-mono font-semibold">ONLINE</span>
            </div>

            <div className="p-3 bg-red-950/20 border border-red-500/20 rounded flex items-start gap-2 text-slate-400">
              <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed">
                Modifications to telemetry values or database links require administrator verification credentials. Contact IT Command for modifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
