import React, { useEffect, useRef } from 'react';
import { 
  Gauge, 
  AlertOctagon, 
  Droplets, 
  BellRing, 
  Layers,
  TrendingUp,
  PieChart as PieIcon,
  AlertTriangle,
  Rss
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { CitizenReport, EmergencyResource, SystemAlert } from '../App';
import L from 'leaflet';

interface CommandCenterProps {
  sensorAqi: number;
  riverLevel: number;
  reservoirCapacity: number;
  riskIndex: number;
  alerts: SystemAlert[];
  reports: CitizenReport[];
  resources: EmergencyResource[];
  darkMode?: boolean;
}

export default function CommandCenter({
  sensorAqi,
  riverLevel,
  reservoirCapacity,
  riskIndex,
  alerts,
  reports,
  resources,
  darkMode = true,
}: CommandCenterProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([12.940, 77.600], 11);
      mapRef.current = map;
    }

    const map = mapRef.current;
    
    // Update Tile Layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    tileLayerRef.current = L.tileLayer(tileUrl, { attribution: '&copy; CARTO' }).addTo(map);
    
    // Clear old layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon || layer instanceof L.Circle || layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Flood Polygon
    L.polygon([
      [12.970, 77.590], [12.972, 77.620], [12.965, 77.660],
      [12.958, 77.660], [12.952, 77.630], [12.959, 77.590]
    ], { color: '#38bdf8', fillColor: '#0284c7', fillOpacity: 0.35, weight: 2 }).addTo(map);

    // Landslide circles
    L.circle([12.918, 77.565], { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.3, radius: 800 }).addTo(map);
    L.circle([12.930, 77.675], { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.3, radius: 600 }).addTo(map);

    // Resources
    resources.forEach(res => {
      const color = res.type === 'Rescue Team' ? '#8b5cf6' : res.type === 'Ambulance' ? '#ef4444' : '#10b981';
      const iconHtml = `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color}"></div>`;
      const customIcon = L.divIcon({ html: iconHtml, className: 'custom-icon', iconSize: [14, 14] });
      L.marker([res.lat, res.lng], { icon: customIcon }).addTo(map);
    });

    // Reports
    reports.forEach(rep => {
      const color = rep.status === 'Pending' ? '#ef4444' : rep.status === 'Verified' ? '#f59e0b' : '#10b981';
      const pulseColor = rep.status === 'Pending' ? 'red' : 'cyan';
      const iconHtml = `<div class="pulse-indicator ${pulseColor}" style="width:16px; height:16px;"><div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid white;"></div></div>`;
      const customIcon = L.divIcon({ html: iconHtml, className: 'custom-pulse-icon', iconSize: [22, 22] });
      L.marker([rep.lat, rep.lng], { icon: customIcon }).addTo(map);
    });
  }, [reports, resources, darkMode]);

  // Mock trend data
  const trendData = [
    { time: '10:00', risk: 62 },
    { time: '11:00', risk: 64 },
    { time: '12:00', risk: 63 },
    { time: '13:00', risk: 67 },
    { time: '14:00', risk: 65 },
    { time: '15:00', risk: 68 },
    { time: '16:00', risk: 70 },
    { time: '17:00', risk: riskIndex },
  ];

  // Pie chart categories
  const pieData = [
    { name: 'Flood', value: reports.filter(r => r.type === 'Flood').length || 4 },
    { name: 'Fire', value: reports.filter(r => r.type === 'Fire').length || 2 },
    { name: 'Pollution', value: reports.filter(r => r.type === 'Pollution').length || 3 },
    { name: 'Landslide', value: reports.filter(r => r.type === 'Landslide').length || 1 },
    { name: 'Others', value: reports.filter(r => !['Flood', 'Fire', 'Pollution', 'Landslide'].includes(r.type)).length || 2 },
  ];

  const COLORS = ['#38bdf8', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      
      {/* 4 KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Risk Index */}
        <div className="glass-panel p-4 rounded-lg flex items-center justify-between border-l-4 border-cyan-500 glow-border-cyan">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Disaster Risk Index</span>
            <div className="text-3xl font-extrabold text-glow-cyan text-cyan-400 mt-1">{riskIndex}%</div>
            <span className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertOctagon className="h-3 w-3" /> High Alert Active
            </span>
          </div>
          <div className="p-3 bg-cyan-950/50 rounded-full border border-cyan-500/20">
            <Gauge className="text-cyan-400 h-6 w-6" />
          </div>
        </div>

        {/* AQI */}
        <div className="glass-panel p-4 rounded-lg flex items-center justify-between border-l-4 border-amber-500">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Air Quality Index</span>
            <div className="text-3xl font-extrabold text-amber-500 mt-1">{sensorAqi} <span className="text-xs font-normal text-slate-400">AQI</span></div>
            <span className="text-xs text-amber-400 flex items-center gap-1 mt-1 font-mono">
              Poor Quality
            </span>
          </div>
          <div className="p-3 bg-amber-950/30 rounded-full border border-amber-500/20">
            <AlertTriangle className="text-amber-500 h-6 w-6" />
          </div>
        </div>

        {/* Reservoir Water Level */}
        <div className="glass-panel p-4 rounded-lg flex items-center justify-between border-l-4 border-blue-500">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Reservoir Reserves</span>
            <div className="text-3xl font-extrabold text-blue-400 mt-1">{reservoirCapacity.toFixed(1)}%</div>
            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <Droplets className="h-3 w-3" /> Safe Capacity
            </span>
          </div>
          <div className="water-wave scale-75 -mr-2">
            <div className="liquid" style={{ top: `${100 - reservoirCapacity}%` }}></div>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="glass-panel p-4 rounded-lg flex items-center justify-between border-l-4 border-red-500">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">Active Incidents</span>
            <div className="text-3xl font-extrabold text-red-500 mt-1">
              {reports.filter(r => r.status !== 'Resolved').length}
            </div>
            <span className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <span className="pulse-indicator red inline-block align-middle mr-1"></span> 
              {reports.filter(r => r.status === 'Pending').length} Pending Review
            </span>
          </div>
          <div className="p-3 bg-red-950/30 rounded-full border border-red-500/20">
            <BellRing className="text-red-500 h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Center Layout Map & alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Placeholder -> Real Map */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-lg flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-bold flex items-center gap-2">
              <Layers className="text-cyan-400 h-4.5 w-4.5" /> Local Incident GIS Map (Live)
            </h3>
            <span className="text-xs font-mono text-slate-400">Centered on Karnataka Command</span>
          </div>
          <div ref={mapContainerRef} className="flex-1 rounded bg-[#090d16] border border-slate-800 relative z-0" style={{ minHeight: '100%' }}>
          </div>
        </div>

        {/* Live warnings feed */}
        <div className="glass-panel p-4 rounded-lg flex flex-col h-[400px]">
          <h3 className="text-md font-bold mb-3 flex items-center gap-2 text-red-400">
            <BellRing className="h-4.5 w-4.5" /> Emergency Broadcast Alerts
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {alerts.map(note => (
              <div key={note.id} className={`p-3 rounded text-xs border ${
                note.type === 'danger' ? 'bg-red-950/20 border-red-500/30 text-red-200' :
                note.type === 'warning' ? 'bg-amber-950/20 border-amber-500/30 text-amber-200' :
                'bg-cyan-950/20 border-cyan-500/30 text-cyan-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold uppercase tracking-wider text-[9px] font-mono">
                    {note.type === 'danger' ? 'CRITICAL' : note.type === 'warning' ? 'WARNING' : 'INFO'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">{note.time}</span>
                </div>
                <p>{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk line chart */}
        <div className="glass-panel p-4 rounded-lg flex flex-col h-[320px]">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-cyan-400" /> Disaster Risk Trend (24h)</h3>
          <div className="flex-1 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  labelClassName="text-slate-400"
                />
                <Line type="monotone" dataKey="risk" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie distribution chart */}
        <div className="glass-panel p-4 rounded-lg flex flex-col h-[320px]">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5"><PieIcon className="h-4 w-4 text-red-400" /> Incident Distribution</h3>
          <div className="flex-1 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live citizen report logs summary */}
        <div className="glass-panel p-4 rounded-lg flex flex-col h-[320px]">
          <h3 className="text-sm font-bold mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Rss className="h-4 w-4 text-emerald-400" /> Recent Citizen Reports</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Live</span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {reports.map(rep => (
              <div key={rep.id} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{rep.id}</span>
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                      rep.type === 'Flood' ? 'bg-blue-900/60 text-blue-300' :
                      rep.type === 'Fire' ? 'bg-red-900/60 text-red-300' :
                      rep.type === 'Pollution' ? 'bg-emerald-900/60 text-emerald-300' :
                      'bg-amber-900/60 text-amber-300'
                    }`}>{rep.type}</span>
                  </div>
                  <p className="text-slate-400 font-mono text-[10px]">{rep.location}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] ${
                  rep.status === 'Pending' ? 'bg-red-950 text-red-400 border border-red-900/40' :
                  rep.status === 'Verified' ? 'bg-amber-950 text-amber-400 border border-amber-900/40' :
                  rep.status === 'Assigned' ? 'bg-blue-950 text-blue-400 border border-blue-900/40' :
                  'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                }`}>{rep.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
