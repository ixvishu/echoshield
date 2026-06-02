import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Info, Navigation, Search } from 'lucide-react';
import { CitizenReport, EmergencyResource } from '../App';

interface GisMapProps {
  reports: CitizenReport[];
  resources: EmergencyResource[];
  darkMode: boolean;
}

export default function GisMap({ reports, resources, darkMode }: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [floodLayer, setFloodLayer] = useState(true);
  const [landslideLayer, setLandslideLayer] = useState(true);
  const [droughtLayer, setDroughtLayer] = useState(false);
  const [infrastructureLayer, setInfrastructureLayer] = useState(true);
  
  const [searchCoords, setSearchCoords] = useState("12.60, 77.12");
  const [tileMode, setTileMode] = useState<'dark' | 'satellite'>('dark');

  // Layer groups references
  const layerGroupsRef = useRef<{
    flood: L.Polygon[];
    landslides: L.Circle[];
    drought: L.Circle[];
    infra: L.Marker[];
    citizen: L.Marker[];
  }>({
    flood: [],
    landslides: [],
    drought: [],
    infra: [],
    citizen: []
  });

  // Re-draw or update elements on active layers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map instance if not exists
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([12.60, 77.12], 12);
      mapRef.current = map;
    }

    const map = mapRef.current;

    // Set Map tiles
    const tileUrl = tileMode === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : darkMode
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    // Clear old tile layers
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(tileUrl, {
      attribution: tileMode === 'satellite' ? 'ArcGIS Imagery' : '&copy; CARTO'
    }).addTo(map);

    // --- CLEAR PREVIOUS LAYERS ---
    layerGroupsRef.current.flood.forEach(p => map.removeLayer(p));
    layerGroupsRef.current.landslides.forEach(c => map.removeLayer(c));
    layerGroupsRef.current.drought.forEach(d => map.removeLayer(d));
    layerGroupsRef.current.infra.forEach(i => map.removeLayer(i));
    layerGroupsRef.current.citizen.forEach(c => map.removeLayer(c));

    layerGroupsRef.current = { flood: [], landslides: [], drought: [], infra: [], citizen: [] };

    // --- DRAW FLOOD LAYER ---
    if (floodLayer) {
      const floodCoords: L.LatLngTuple[] = [
        [12.63, 77.11], [12.632, 77.14], [12.625, 77.18],
        [12.618, 77.18], [12.612, 77.15], [12.619, 77.11]
      ];
      const polygon = L.polygon(floodCoords, {
        color: '#38bdf8',
        fillColor: '#0284c7',
        fillOpacity: 0.35,
        weight: 2
      }).addTo(map).bindPopup("<b>Flood-Prone Zone A</b><br>River level alert: Critical");
      layerGroupsRef.current.flood.push(polygon);
    }

    // --- DRAW LANDSLIDE LAYER ---
    if (landslideLayer) {
      const landslide1 = L.circle([12.578, 77.085], {
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.3,
        radius: 800
      }).addTo(map).bindPopup("<b>Landslide Risk zone</b>");
      layerGroupsRef.current.landslides.push(landslide1);

      const landslide2 = L.circle([12.590, 77.195], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.3,
        radius: 600
      }).addTo(map).bindPopup("<b>Erosion Hazard Zone</b>");
      layerGroupsRef.current.landslides.push(landslide2);
    }

    // --- DRAW DROUGHT LAYER ---
    if (droughtLayer) {
      const drought = L.circle([12.55, 77.13], {
        color: '#ec4899',
        fillColor: '#ec4899',
        fillOpacity: 0.15,
        radius: 2000
      }).addTo(map).bindPopup("<b>Dry Groundwater Basin</b>");
      layerGroupsRef.current.drought.push(drought);
    }

    // --- DRAW INFRASTRUCTURE LAYER ---
    if (infrastructureLayer) {
      resources.forEach(res => {
        const color = res.type === 'Rescue Team' ? '#8b5cf6' : res.type === 'Ambulance' ? '#ef4444' : '#10b981';
        const iconHtml = `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color}"></div>`;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-icon',
          iconSize: [14, 14]
        });

        const marker = L.marker([res.lat, res.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<b>${res.name}</b><br>Type: ${res.type}<br>Contact: ${res.contact}`);
        layerGroupsRef.current.infra.push(marker);
      });
    }

    // --- DRAW CITIZEN REPORTS ---
    reports.forEach(rep => {
      const color = rep.status === 'Pending' ? '#ef4444' : rep.status === 'Verified' ? '#f59e0b' : '#10b981';
      const pulseColor = rep.status === 'Pending' ? 'red' : 'cyan';
      const iconHtml = `<div class="pulse-indicator ${pulseColor}" style="width:16px; height:16px;"><div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid white;"></div></div>`;
      
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-pulse-icon',
        iconSize: [22, 22]
      });

      const marker = L.marker([rep.lat, rep.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>Report: ${rep.type}</b><br>${rep.location}<br>Status: <b>${rep.status}</b>`);
      layerGroupsRef.current.citizen.push(marker);
    });

  }, [floodLayer, landslideLayer, droughtLayer, infrastructureLayer, tileMode, reports, resources, darkMode]);

  const handleSearch = () => {
    if (!mapRef.current) return;
    const parts = searchCoords.split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      mapRef.current.setView([parts[0], parts[1]], 14);
    } else {
      alert("Please enter coordinates in 'latitude, longitude' format.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="text-cyan-400 h-6 w-6" /> GIS Intelligence Command Map
          </h2>
          <p className="text-slate-400 text-sm">Interactive geographic overlay of disaster hazard limits and dispatch assets.</p>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button 
            onClick={() => setFloodLayer(!floodLayer)}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 border transition-all ${floodLayer ? 'bg-blue-950 text-blue-300 border-blue-600' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            Flood-Prone Overlays
          </button>
          <button 
            onClick={() => setLandslideLayer(!landslideLayer)}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 border transition-all ${landslideLayer ? 'bg-orange-950 text-orange-300 border-orange-600' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            Landslide Hazard Zone
          </button>
          <button 
            onClick={() => setDroughtLayer(!droughtLayer)}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 border transition-all ${droughtLayer ? 'bg-pink-950 text-pink-300 border-pink-600' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            Drought Vulnerability
          </button>
          <button 
            onClick={() => setInfrastructureLayer(!infrastructureLayer)}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 border transition-all ${infrastructureLayer ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            Critical Services
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Ops panel */}
        <div className="glass-panel p-4 rounded-lg space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold border-b border-slate-800 pb-2">GIS Control Deck</h3>
          
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Map View Mode</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => setTileMode('dark')}
                className={`py-1.5 rounded font-mono ${tileMode === 'dark' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                Dark Command
              </button>
              <button 
                onClick={() => setTileMode('satellite')}
                className={`py-1.5 rounded font-mono ${tileMode === 'satellite' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                Satellite ESG
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Locate Latitude, Longitude</label>
            <div className="flex gap-1.5">
              <input 
                type="text" 
                value={searchCoords} 
                onChange={e => setSearchCoords(e.target.value)}
                placeholder="12.60, 77.12" 
                className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded text-xs w-full text-slate-200 focus:outline-none focus:border-cyan-500" 
              />
              <button onClick={handleSearch} className="bg-cyan-600 hover:bg-cyan-500 px-3 rounded text-xs">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-400 font-semibold block mb-1">Interactive Elements:</span>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-red-500"></div> Pending Citizens reports</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-amber-500"></div> Dispatched assets</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-emerald-500"></div> Relief camps / Shelters</div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded text-xs border border-slate-800 flex items-start gap-2 text-slate-400">
            <Info className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px]">Draw tools support coordinates bounding box parameters. PostGIS geometric entities are mapped automatically.</p>
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 glass-panel p-2 rounded-lg h-[550px]">
          <div ref={mapContainerRef} className="h-full w-full rounded bg-[#090d16] border border-slate-800" style={{ minHeight: '100%' }}></div>
        </div>
      </div>
    </div>
  );
}
