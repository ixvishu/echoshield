import React from 'react';
import { Wind, Droplet, Sun, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface EnvironmentalProps {
  sensorAqi: number;
  riverLevel: number;
  weather: {
    temp: number;
    hum: number;
    wind: number;
    rain: number;
  };
}

export default function EnvironmentalMonitoring({ sensorAqi, riverLevel, weather }: EnvironmentalProps) {
  
  // Historical data
  const aqiData = [
    { name: '09:00', aqi: 150 },
    { name: '10:00', aqi: 162 },
    { name: '11:00', aqi: 175 },
    { name: '12:00', aqi: 185 },
    { name: '13:00', aqi: 192 },
    { name: '14:00', aqi: 210 },
    { name: '15:00', aqi: 204 },
    { name: '16:00', aqi: sensorAqi },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Wind className="text-cyan-400 h-6 w-6" /> Environmental Sensor Network
        </h2>
        <p className="text-slate-400 text-sm">Real-time parameters tracked across regional telemetry sensors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* AIR DATA */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-md font-bold text-amber-500 flex items-center gap-2">
            <Wind className="h-5 w-5" /> Air Quality Grid
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">PM2.5</span>
              <span className="text-xl font-bold font-mono">{sensorAqi} μg/m³</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">PM10</span>
              <span className="text-xl font-bold font-mono">{+(sensorAqi * 1.3).toFixed(0)} μg/m³</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">CO2 LEVEL</span>
              <span className="text-xl font-bold font-mono">424 ppm</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">AQI STATUS</span>
              <span className="text-sm font-bold text-red-400 flex items-center gap-1 mt-1 font-mono">Poor</span>
            </div>
          </div>
        </div>

        {/* WATER DATA */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-md font-bold text-cyan-400 flex items-center gap-2">
            <Droplet className="h-5 w-5" /> River Hydro-Quality
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">pH LIMITS</span>
              <span className="text-xl font-bold font-mono text-emerald-450">7.4 <span className="text-[10px] font-normal text-slate-400">Neutral</span></span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">TURBIDITY</span>
              <span className="text-xl font-bold font-mono">4.8 NTU</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">DISSOLVED O2</span>
              <span className="text-xl font-bold font-mono">6.2 mg/L</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">ELEVATION</span>
              <span className="text-lg font-bold font-mono text-cyan-400">{riverLevel} m</span>
            </div>
          </div>
        </div>

        {/* METEOROLOGICAL DATA */}
        <div className="glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2">
            <Sun className="h-5 w-5" /> Met Observatory
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">TEMP</span>
              <span className="text-xl font-bold font-mono">{weather.temp}°C</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">HUMIDITY</span>
              <span className="text-xl font-bold font-mono">{weather.hum}%</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">WIND</span>
              <span className="text-xl font-bold font-mono">{weather.wind} km/h</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">ACCUM. RAIN</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{weather.rain} mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts trend */}
      <div className="glass-panel p-4 rounded-lg h-[350px]">
        <h3 className="text-md font-bold mb-3 flex items-center gap-1.5"><BarChart2 className="h-4.5 w-4.5 text-cyan-400" /> PM2.5 Micrograms Trends (8 Hours)</h3>
        <div className="h-[285px] text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aqiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#94a3b8' }} />
              <Bar dataKey="aqi" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="PM2.5 Level" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
