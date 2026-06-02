import React from 'react';
import { Brain, Activity, Heart, Eye } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AiPredictionProps {
  riverLevel: number;
}

export default function AiPrediction({ riverLevel }: AiPredictionProps) {
  
  // Forecast Data
  const forecastData = [
    { name: 'Mon', actual: 47.5, model: 47.5 },
    { name: 'Tue', actual: 47.7, model: 47.6 },
    { name: 'Wed', actual: 47.9, model: 47.8 },
    { name: 'Thu', actual: riverLevel, model: riverLevel },
    { name: 'Fri', actual: null, model: riverLevel + 0.4 },
    { name: 'Sat', actual: null, model: riverLevel + 0.9 },
    { name: 'Sun', actual: null, model: riverLevel + 1.3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Brain className="text-cyan-400 h-6 w-6" /> AI Climate Predictive Engine
        </h2>
        <p className="text-slate-400 text-sm">Predictive modeling using regional telemetry and thermal indexes to forecast disasters.</p>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Flood Forecast */}
        <div className="glass-panel p-5 rounded-lg border-t-4 border-cyan-500 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-bold">Flood Probability</h3>
              <span className="text-xs px-2 py-0.5 bg-red-950 text-red-400 rounded-full font-mono font-bold">Critical</span>
            </div>
            <div className="text-4xl font-extrabold text-cyan-400 my-3">87%</div>
            <p className="text-xs text-slate-400 mb-4 font-mono leading-relaxed">
              River forecast model projects levels exceeding safety bounds of 48.8m within 48 hours.
            </p>
          </div>
          <div className="space-y-1 text-xs border-t border-slate-800 pt-3 text-slate-300">
            <div className="flex justify-between"><span>Discharge Index:</span> <span className="text-cyan-450 font-mono">1,820 m³/s</span></div>
            <div className="flex justify-between"><span>Model Confidence:</span> <span className="text-emerald-450 font-mono">92%</span></div>
          </div>
        </div>

        {/* Heatwave Card */}
        <div className="glass-panel p-5 rounded-lg border-t-4 border-amber-500 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-bold">Thermal Peaks</h3>
              <span className="text-xs px-2 py-0.5 bg-amber-950 text-amber-400 rounded-full font-mono font-bold">High Risk</span>
            </div>
            <div className="text-4xl font-extrabold text-amber-400 my-3">42.8°C</div>
            <p className="text-xs text-slate-400 mb-4 font-mono leading-relaxed">
              Urban heat stress forecasting projects maximum temperatures hitting 43.5°C by Friday afternoon.
            </p>
          </div>
          <div className="space-y-1 text-xs border-t border-slate-800 pt-3 text-slate-300">
            <div className="flex justify-between"><span>Humidity Index:</span> <span className="text-amber-450 font-mono">42%</span></div>
            <div className="flex justify-between"><span>Model Confidence:</span> <span className="text-emerald-450 font-mono">88%</span></div>
          </div>
        </div>

        {/* Drought Depletion */}
        <div className="glass-panel p-5 rounded-lg border-t-4 border-emerald-500 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-bold">Drought Outlook</h3>
              <span className="text-xs px-2 py-0.5 bg-emerald-950 text-emerald-450 rounded-full font-mono font-bold">Stable</span>
            </div>
            <div className="text-4xl font-extrabold text-emerald-400 my-3">44 Days</div>
            <p className="text-xs text-slate-405 mb-4 font-mono leading-relaxed">
              Local reservoirs hold sufficient capacities below critical evaporation index limits.
            </p>
          </div>
          <div className="space-y-1 text-xs border-t border-slate-800 pt-3 text-slate-300">
            <div className="flex justify-between"><span>Depletion Rate:</span> <span className="text-emerald-450 font-mono">-0.4%/day</span></div>
            <div className="flex justify-between"><span>Model Confidence:</span> <span className="text-emerald-450 font-mono">95%</span></div>
          </div>
        </div>
      </div>

      {/* Grid: Graph and resource plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* River Forecast Elevation Graph */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-lg h-[350px]">
          <h3 className="text-md font-bold mb-3 flex items-center gap-1.5"><Activity className="h-4.5 w-4.5 text-cyan-400" /> River Bellandur Height Prediction Model</h3>
          <div className="h-[280px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="actualColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="modelColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis domain={[46, 51]} stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#94a3b8' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="actual" stroke="#38bdf8" fillOpacity={1} fill="url(#actualColor)" name="Observed Level (m)" />
                <Area type="monotone" dataKey="model" stroke="#ec4899" strokeDasharray="4 4" fillOpacity={1} fill="url(#modelColor)" name="AI Predictive Mean (m)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Allocation Recommendation */}
        <div className="glass-panel p-4 rounded-lg flex flex-col justify-between h-[350px]">
          <div>
            <h3 className="text-md font-bold mb-1 flex items-center gap-1.5"><Heart className="h-4.5 w-4.5 text-red-500" /> Predictive Resource Plan</h3>
            <p className="text-slate-400 text-xs mb-4">Recommended assets based on probability grids and local vulnerabilities.</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Medical Ambulances</span>
                  <span className="text-cyan-400 font-mono font-semibold">12 Units (Rec)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Rescue Boats & NDRF</span>
                  <span className="text-pink-400 font-mono font-semibold">5 Units (Rec)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Emergency Relief Beds</span>
                  <span className="text-emerald-400 font-mono font-semibold">850 Beds (Rec)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded text-xs flex items-start gap-2 text-slate-400">
            <Eye className="h-4.5 w-4.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px]">Asset calculations are updated dynamically as flood and meteorological metrics fluctuate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
