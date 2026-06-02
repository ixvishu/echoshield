import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Info, Navigation, Search, Lock, Unlock, Eye, Activity } from 'lucide-react';
import { CitizenReport, EmergencyResource } from '../App';

interface GisMapProps {
  reports: CitizenReport[];
  resources: EmergencyResource[];
  darkMode?: boolean;
  userLocation: {
    lat: number;
    lng: number;
    district: string;
    city: string;
    state: string;
    addressFetched: boolean;
    timestamp?: string;
    speed?: number;
    direction?: string;
  } | null;
  localResources: EmergencyResource[];
  mapAction: {
    type: 'center_user' | 'show_shelter' | 'show_hospitals' | null;
    timestamp: number;
  } | null;
  floodPolygon: [number, number][];
  landslideCircles: { center: [number, number]; radius: number; name: string }[];
  droughtCircle: { center: [number, number]; radius: number; name: string } | null;
  sensorAqi: number;
  locationHistory: Array<{ lat: number; lng: number }>;
  distanceTraveled: number;
  currentSpeed: number;
  currentDirection: string;
  followUser: boolean;
  setFollowUser: (val: boolean) => void;
  onlineCount: number;
  activeTrackedUsers: any;
  liveLocationFeed: string[];
  activeBaseMap: string;
  setActiveBaseMap: (val: string) => void;
  evacuationPath: Array<[number, number]> | null;
  geofenceAlert: string | null;
  setGeofenceAlert: (val: string | null) => void;
  showHeatmap: boolean;
  setShowHeatmap: (val: boolean) => void;
  heatmapType: string;
  setHeatmapType: (val: string) => void;
}

export default function GisMap({ 
  reports, 
  resources, 
  darkMode = true,
  userLocation,
  localResources = [],
  mapAction,
  floodPolygon,
  landslideCircles,
  droughtCircle,
  sensorAqi,
  locationHistory,
  distanceTraveled,
  currentSpeed,
  currentDirection,
  followUser,
  setFollowUser,
  onlineCount,
  activeTrackedUsers,
  liveLocationFeed,
  activeBaseMap,
  setActiveBaseMap,
  evacuationPath,
  geofenceAlert,
  setGeofenceAlert,
  showHeatmap,
  setShowHeatmap,
  heatmapType,
  setHeatmapType
}: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hasCenteredOnLoadRef = useRef<boolean>(false);
  const shelterMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const hospitalMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const otherTrackedMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // Layer groups references
  const historyTrailLayerRef = useRef<L.LayerGroup | null>(null);
  const evacuationRouteLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [floodLayer, setFloodLayer] = useState(true);
  const [landslideLayer, setLandslideLayer] = useState(true);
  const [droughtLayer, setDroughtLayer] = useState(false);
  const [infrastructureLayer, setInfrastructureLayer] = useState(true);
  
  const [searchCoords, setSearchCoords] = useState("12.9716, 77.5946");

  // Main static polygon/circle hazard layers group
  const staticHazardsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = userLocation ? userLocation.lat : 12.9716;
    const initialLng = userLocation ? userLocation.lng : 77.5946;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 12);
    mapRef.current = map;

    // Initialize Layer Groups
    staticHazardsLayerGroupRef.current = L.layerGroup().addTo(map);
    historyTrailLayerRef.current = L.layerGroup().addTo(map);
    evacuationRouteLayerRef.current = L.layerGroup().addTo(map);
    heatmapLayerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      hasCenteredOnLoadRef.current = false;
      shelterMarkersRef.current.clear();
      hospitalMarkersRef.current.clear();
      vehicleMarkersRef.current.clear();
      otherTrackedMarkersRef.current.clear();
    };
  }, []);

  // Update Base Map Style
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attrib = '&copy; CARTO';
    
    if (activeBaseMap === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attrib = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (activeBaseMap === 'terrain') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attrib = 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)';
    } else if (!darkMode) {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    }

    tileLayerRef.current = L.tileLayer(tileUrl, { 
      attribution: attrib,
      maxZoom: 18
    }).addTo(map);
  }, [activeBaseMap, darkMode]);

  // Draw Static Hazards & Citizen Reports
  useEffect(() => {
    if (!mapRef.current || !staticHazardsLayerGroupRef.current) return;
    const map = mapRef.current;
    const group = staticHazardsLayerGroupRef.current;
    
    group.clearLayers();

    // --- DRAW FLOOD LAYER ---
    if (floodLayer) {
      const floodCoords = (floodPolygon && floodPolygon.length > 0) ? floodPolygon : [
        [12.942, 77.660] as [number, number], [12.945, 77.675] as [number, number], 
        [12.930, 77.685] as [number, number], [12.925, 77.670] as [number, number], 
        [12.932, 77.658] as [number, number]
      ];
      L.polygon(floodCoords as L.LatLngTuple[], {
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.25,
        weight: 1.5
      }).addTo(group).bindPopup("<b>Flood-Prone Overlays Zone A</b>");
    }

    // --- DRAW LANDSLIDE LAYER ---
    if (landslideLayer) {
      const circles = (landslideCircles && landslideCircles.length > 0) ? landslideCircles : [
        { center: [12.964, 77.640] as [number, number], radius: 400, name: "Indiranagar Tree Fall zone" },
        { center: [12.917, 77.623] as [number, number], radius: 500, name: "Silk Board Waterlogging Hotspot" }
      ];
      circles.forEach(c => {
        L.circle(c.center, { 
          color: '#d97706', 
          fillColor: '#f59e0b', 
          fillOpacity: 0.2, 
          radius: c.radius 
        }).addTo(group).bindPopup(`<b>${c.name}</b>`);
      });
    }

    // --- DRAW DROUGHT LAYER ---
    if (droughtLayer) {
      const c = droughtCircle || { center: [13.03, 77.59] as [number, number], radius: 2500, name: "Water Scarcity Zone" };
      L.circle(c.center, { 
        color: '#db2777', 
        fillColor: '#ec4899', 
        fillOpacity: 0.1, 
        radius: c.radius 
      }).addTo(group).bindPopup(`<b>${c.name}</b>`);
    }

    // --- DRAW CITIZEN REPORTS ---
    reports.forEach(rep => {
      const color = rep.status === 'Pending' ? '#dc2626' : rep.status === 'Verified' ? '#d97706' : '#16a34a';
      const iconHtml = `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid white; box-shadow: 0 0 5px ${color};"></div>`;
      const customIcon = L.divIcon({ html: iconHtml, className: 'corp-rep-icon', iconSize: [10, 10] });
      L.marker([rep.lat, rep.lng], { icon: customIcon }).addTo(group).bindPopup(`<b>Incident: ${rep.type}</b><br>${rep.location}`);
    });
  }, [floodLayer, landslideLayer, droughtLayer, reports, floodPolygon, landslideCircles, droughtCircle]);

  // smooth user marker animation function
  const animateMarker = (marker: L.Marker, fromLatLng: L.LatLng, toLatLng: L.LatLng, duration = 1000) => {
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      const lat = fromLatLng.lat + (toLatLng.lat - fromLatLng.lat) * ease;
      const lng = fromLatLng.lng + (toLatLng.lng - fromLatLng.lng) * ease;
      marker.setLatLng([lat, lng]);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  // User position updating, trail polyline, and auto-centering
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    
    const map = mapRef.current;
    const newPos: L.LatLngExpression = [userLocation.lat, userLocation.lng];

    if (!userMarkerRef.current) {
      const userIcon = L.divIcon({
        html: `<div style="
          width: 16px; 
          height: 16px; 
          background-color: #2563eb; 
          border: 2.5px solid white; 
          border-radius: 50%; 
          box-shadow: 0 0 10px #2563eb, 0 0 0 5px rgba(37, 99, 235, 0.3);
          position: relative;
        ">
          <div style="
            position: absolute;
            top: -5px;
            left: -5px;
            width: 22px;
            height: 22px;
            border: 2.5px solid rgba(37, 99, 235, 0.5);
            border-radius: 50%;
            animation: pulse-ring 1.8s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
            box-sizing: border-box;
          "></div>
        </div>`,
        className: 'user-loc-pin',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const uMarker = L.marker(newPos, { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>You are here</b><br>${userLocation.district}, ${userLocation.city}<br>Lat: ${userLocation.lat.toFixed(5)}<br>Lng: ${userLocation.lng.toFixed(5)}`);
      
      userMarkerRef.current = uMarker;
    } else {
      const oldLatLng = userMarkerRef.current.getLatLng();
      const newLatLng = L.latLng(userLocation.lat, userLocation.lng);
      animateMarker(userMarkerRef.current, oldLatLng, newLatLng, 1000);
      userMarkerRef.current.setPopupContent(`<b>You are here</b><br>${userLocation.district}, ${userLocation.city}<br>Lat: ${userLocation.lat.toFixed(5)}<br>Lng: ${userLocation.lng.toFixed(5)}`);
    }

    if (!hasCenteredOnLoadRef.current) {
      map.setView(newPos, 14);
      hasCenteredOnLoadRef.current = true;
      userMarkerRef.current.openPopup();
    } else if (followUser) {
      map.panTo(newPos);
    }

    // Draw travel path trail
    if (historyTrailLayerRef.current) {
      historyTrailLayerRef.current.clearLayers();
      if (locationHistory && locationHistory.length > 1) {
        L.polyline(locationHistory as L.LatLngExpression[], { 
          color: '#06b6d4', 
          weight: 4, 
          opacity: 0.85, 
          dashArray: '5, 8' 
        }).addTo(historyTrailLayerRef.current);
      }
    }

    // Draw evacuation path
    if (evacuationRouteLayerRef.current) {
      evacuationRouteLayerRef.current.clearLayers();
      if (evacuationPath && evacuationPath.length > 1) {
        L.polyline(evacuationPath as L.LatLngExpression[], { 
          color: '#10b981', 
          weight: 4, 
          opacity: 0.9, 
          dashArray: '8, 12', 
          lineCap: 'round' 
        }).addTo(evacuationRouteLayerRef.current);
      }
    }
  }, [userLocation, locationHistory, evacuationPath, followUser]);

  // Real-time Emergency Resources Marker updating with smooth animations
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    if (infrastructureLayer) {
      const updatedIds = new Set();
      const allRes = [...resources, ...localResources];
      allRes.forEach(res => {
        updatedIds.add(res.id);
        const pos: L.LatLngExpression = [res.lat, res.lng];

        if (vehicleMarkersRef.current.has(res.id)) {
          const marker = vehicleMarkersRef.current.get(res.id)!;
          const oldLatLng = marker.getLatLng();
          const newLatLng = L.latLng(res.lat, res.lng);
          
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / 1000, 1);
            const latVal = oldLatLng.lat + (newLatLng.lat - oldLatLng.lat) * progress;
            const lngVal = oldLatLng.lng + (newLatLng.lng - oldLatLng.lng) * progress;
            marker.setLatLng([latVal, lngVal]);
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);

          let distToUser = "";
          if (userLocation) {
            const d = (getDistanceLoc(userLocation.lat, userLocation.lng, res.lat, res.lng) / 1000).toFixed(2);
            const eta = Math.round(+d * 1.5 + 2);
            distToUser = `<br>Distance: <b>${d} km</b><br>ETA: <b>${eta} mins</b>`;
          }
          
          marker.setPopupContent(`<b>${res.name}</b><br>Type: <b>${res.type}</b><br>Status: <span class="text-cyan-400 font-bold">${res.status}</span><br>Contact: ${res.contact}${distToUser}`);
        } else {
          let color = '#8b5cf6';
          let iconHtml = '';
          const isSpecial = ['Hospital', 'Shelter', 'Relief Camp', 'Fire Station'].includes(res.type);

          if (res.type === 'Hospital') {
            color = '#dc2626';
            iconHtml = `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 9px; box-shadow: 0 0 8px ${color};">H</div>`;
          } else if (res.type === 'Shelter') {
            color = '#16a34a';
            iconHtml = `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 9px; box-shadow: 0 0 8px ${color};">S</div>`;
          } else if (res.type === 'Relief Camp') {
            color = '#2563eb';
            iconHtml = `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 9px; box-shadow: 0 0 8px ${color};">C</div>`;
          } else if (res.type === 'Fire Station') {
            color = '#ea580c';
            iconHtml = `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 9px; box-shadow: 0 0 8px ${color};">F</div>`;
          } else if (res.type === 'Ambulance') {
            color = '#dc2626';
            iconHtml = `<div class="animate-pulse" style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 8px; box-shadow: 0 0 8px ${color};"><i class="fa-solid fa-truck-medical text-[7px]"></i></div>`;
          } else if (res.type === 'Rescue Team') {
            color = '#eab308';
            iconHtml = `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; color: black; font-weight: bold; font-size: 8px; box-shadow: 0 0 8px ${color};"><i class="fa-solid fa-person-shelter text-[7px]"></i></div>`;
          } else {
            color = '#06b6d4';
            iconHtml = `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 8px; box-shadow: 0 0 5px ${color}; font-family: sans-serif;">V</div>`;
          }

          const customIcon = L.divIcon({
            html: iconHtml,
            className: isSpecial ? 'custom-special-pin' : 'corp-icon',
            iconSize: isSpecial ? [18, 18] : [16, 16],
            iconAnchor: isSpecial ? [9, 9] : [8, 8]
          });

          let distToUser = "";
          if (userLocation) {
            const d = (getDistanceLoc(userLocation.lat, userLocation.lng, res.lat, res.lng) / 1000).toFixed(2);
            const eta = Math.round(+d * 1.5 + 2);
            distToUser = `<br>Distance: <b>${d} km</b><br>ETA: <b>${eta} mins</b>`;
          }

          const marker = L.marker(pos, { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${res.name}</b><br>Type: <b>${res.type}</b><br>Status: <span class="text-cyan-405 font-bold">${res.status}</span><br>Contact: ${res.contact}${distToUser}`);

          vehicleMarkersRef.current.set(res.id, marker);
          
          if (res.type === 'Shelter') {
            shelterMarkersRef.current.set(res.id, marker);
          } else if (res.type === 'Hospital') {
            hospitalMarkersRef.current.set(res.id, marker);
          }
        }
      });

      for (let [id, marker] of vehicleMarkersRef.current.entries()) {
        if (!updatedIds.has(id)) {
          map.removeLayer(marker);
          vehicleMarkersRef.current.delete(id);
          shelterMarkersRef.current.delete(id);
          hospitalMarkersRef.current.delete(id);
        }
      }
    } else {
      for (let [id, marker] of vehicleMarkersRef.current.entries()) {
        map.removeLayer(marker);
      }
      vehicleMarkersRef.current.clear();
      shelterMarkersRef.current.clear();
      hospitalMarkersRef.current.clear();
    }
  }, [resources, localResources, infrastructureLayer, userLocation]);

  // Real-time Active Other Tracked Users Effect
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const activeIds = new Set();

    Object.keys(activeTrackedUsers || {}).forEach(uid => {
      if (uid === "Officer-Mobile") return;

      const udata = activeTrackedUsers[uid];
      if (!udata.lat || !udata.lng) return;

      activeIds.add(uid);
      const pos: L.LatLngExpression = [udata.lat, udata.lng];

      if (otherTrackedMarkersRef.current.has(uid)) {
        const marker = otherTrackedMarkersRef.current.get(uid)!;
        marker.setLatLng(pos);
        marker.setPopupContent(`<b>Active Tracked User</b><br>ID: <b>${uid}</b><br>District: ${udata.district}<br>Speed: ${udata.speed} km/h<br>Last Update: ${udata.timestamp}`);
      } else {
        const userIcon = L.divIcon({
          html: `<div style="
            width: 14px; 
            height: 14px; 
            background-color: #ec4899; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 0 8px #ec4899;
          "></div>`,
          className: 'other-user-pin',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        const marker = L.marker(pos, { icon: userIcon })
          .addTo(map)
          .bindPopup(`<b>Active Tracked User</b><br>ID: <b>${uid}</b><br>District: ${udata.district}<br>Speed: ${udata.speed} km/h<br>Last Update: ${udata.timestamp}`);

        otherTrackedMarkersRef.current.set(uid, marker);
      }
    });

    for (let [uid, marker] of otherTrackedMarkersRef.current.entries()) {
      if (!activeIds.has(uid)) {
        map.removeLayer(marker);
        otherTrackedMarkersRef.current.delete(uid);
      }
    }
  }, [activeTrackedUsers]);

  // Heatmap rendering effect
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    const map = mapRef.current;

    if (!heatmapLayerGroupRef.current) {
      heatmapLayerGroupRef.current = L.layerGroup().addTo(map);
    }
    heatmapLayerGroupRef.current.clearLayers();

    if (showHeatmap) {
      const lat = userLocation.lat;
      const lng = userLocation.lng;

      let points: Array<{ lat: number; lng: number; intensity: number; label: string }> = [];
      if (heatmapType === "flood") {
        points = [
          { lat: lat + 0.005, lng: lng - 0.004, intensity: 0.8, label: "Severe Waterlogging Hazard" },
          { lat: lat - 0.003, lng: lng + 0.006, intensity: 0.6, label: "Medium Waterlogging Hazard" },
          { lat: lat + 0.002, lng: lng + 0.002, intensity: 0.9, label: "Critical Flood Basin Center" }
        ];
      } else if (heatmapType === "population") {
        points = [
          { lat: lat + 0.001, lng: lng + 0.001, intensity: 0.95, label: "High Density Commercial Zone" },
          { lat: lat - 0.004, lng: lng - 0.003, intensity: 0.7, label: "Residential Zone" },
          { lat: lat + 0.006, lng: lng - 0.002, intensity: 0.5, label: "Low Density Outskirts" }
        ];
      } else {
        points = [
          { lat: lat - 0.005, lng: lng - 0.006, intensity: 0.9, label: "Silk Board PM2.5 Peak Area" },
          { lat: lat + 0.007, lng: lng + 0.004, intensity: 0.45, label: "Green Belt Zone" },
          { lat: lat - 0.001, lng: lng + 0.002, intensity: 0.75, label: "Industrial AQI Sensor Grid" }
        ];
      }

      points.forEach(pt => {
        const baseColor = heatmapType === "flood" ? "#3b82f6" : heatmapType === "population" ? "#10b981" : "#eab308";
        
        L.circle([pt.lat, pt.lng], {
          color: 'transparent',
          fillColor: baseColor,
          fillOpacity: pt.intensity * 0.15,
          radius: 400
        }).addTo(heatmapLayerGroupRef.current!).bindPopup(`<b>Heatmap: ${pt.label}</b>`);

        L.circle([pt.lat, pt.lng], {
          color: 'transparent',
          fillColor: baseColor,
          fillOpacity: pt.intensity * 0.35,
          radius: 200
        }).addTo(heatmapLayerGroupRef.current!);

        L.circle([pt.lat, pt.lng], {
          color: 'transparent',
          fillColor: '#ffffff',
          fillOpacity: pt.intensity * 0.6,
          radius: 50
        }).addTo(heatmapLayerGroupRef.current!);
      });
    }
  }, [showHeatmap, heatmapType, userLocation]);

  // Handle mapAction triggers
  useEffect(() => {
    if (!mapRef.current || !mapAction) return;

    const map = mapRef.current;

    if (mapAction.type === 'center_user') {
      if (userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 14);
        userMarkerRef.current?.openPopup();
      }
    } else if (mapAction.type === 'show_shelter') {
      const allResources = [...resources, ...localResources];
      const shelters = allResources.filter(r => r.type === 'Shelter');
      if (shelters.length > 0 && userLocation) {
        let closest = shelters[0];
        let minDist = getDistanceLoc(userLocation.lat, userLocation.lng, closest.lat, closest.lng);
        for (let i = 1; i < shelters.length; i++) {
          const dist = getDistanceLoc(userLocation.lat, userLocation.lng, shelters[i].lat, shelters[i].lng);
          if (dist < minDist) {
            minDist = dist;
            closest = shelters[i];
          }
        }
        map.setView([closest.lat, closest.lng], 15);
        const marker = shelterMarkersRef.current.get(closest.id);
        marker?.openPopup();
      }
    } else if (mapAction.type === 'show_hospitals') {
      const allResources = [...resources, ...localResources];
      const hospitals = allResources.filter(r => r.type === 'Hospital');
      if (hospitals.length > 0) {
        const bounds = L.latLngBounds(hospitals.map(h => [h.lat, h.lng]));
        if (userLocation) {
          bounds.extend([userLocation.lat, userLocation.lng]);
        }
        map.fitBounds(bounds, { padding: [50, 50] });
        
        if (userLocation) {
          let closest = hospitals[0];
          let minDist = getDistanceLoc(userLocation.lat, userLocation.lng, closest.lat, closest.lng);
          for (let i = 1; i < hospitals.length; i++) {
            const dist = getDistanceLoc(userLocation.lat, userLocation.lng, hospitals[i].lat, hospitals[i].lng);
            if (dist < minDist) {
              minDist = dist;
              closest = hospitals[i];
            }
          }
          const marker = hospitalMarkersRef.current.get(closest.id);
          marker?.openPopup();
        }
      }
    }
  }, [mapAction]);

  const handleLocateMe = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
    userMarkerRef.current?.openPopup();
  };

  const handleSearch = () => {
    if (!mapRef.current) return;
    const parts = searchCoords.split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      mapRef.current.setView([parts[0], parts[1]], 14);
    } else {
      alert("Please enter coordinates in 'latitude, longitude' format.");
    }
  };

  const getDistanceLoc = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3;
    const phi1 = lat1 * Math.PI/180;
    const phi2 = lat2 * Math.PI/180;
    const deltaPhi = (lat2-lat1) * Math.PI/180;
    const deltaLambda = (lng2-lng1) * Math.PI/180;
    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const isPointInPolygonLoc = (lat1: number, lng1: number, polygon: [number, number][]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = ((yi > lng1) !== (yj > lng1))
          && (lat1 < (xj - xi) * (lng1 - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const latVal = userLocation?.lat || 12.952;
  const lngVal = userLocation?.lng || 77.638;
  const isInsideFlood = userLocation && floodPolygon && floodPolygon.length > 0 
    ? isPointInPolygonLoc(latVal, lngVal, floodPolygon) 
    : false;
    
  const isInsideLandslide = userLocation && landslideCircles 
    ? landslideCircles.some(c => getDistanceLoc(latVal, lngVal, c.center[0], c.center[1]) < c.radius)
    : false;
    
  const isInsideDrought = userLocation && droughtCircle 
    ? getDistanceLoc(latVal, lngVal, droughtCircle.center[0], droughtCircle.center[1]) < droughtCircle.radius
    : false;

  const allResources = [...resources, ...localResources];
  const shelters = allResources.filter(r => r.type === 'Shelter');
  let nearestShelter: EmergencyResource | null = null;
  let nearestDistance = Infinity;
  
  if (userLocation && shelters.length > 0) {
    shelters.forEach(s => {
      const dist = getDistanceLoc(latVal, lngVal, s.lat, s.lng);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestShelter = s;
      }
    });
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
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
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 border transition-all ${floodLayer ? 'bg-blue-950 text-blue-300 border-blue-650' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
            Flood-Prone Overlays
          </button>
          <button 
            onClick={() => setLandslideLayer(!landslideLayer)}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 border transition-all ${landslideLayer ? 'bg-orange-955 text-orange-300 border-orange-600' : 'bg-slate-900 text-slate-500 border-slate-800'}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Ops panel */}
        <div className="glass-panel p-4 rounded-lg space-y-4 lg:col-span-1 h-[550px] overflow-y-auto scrollbar-thin flex flex-col justify-start">
          <h3 className="text-sm font-bold border-b border-slate-800 pb-2">GIS Control Deck</h3>
          
          <div className="pt-2">
            <label className="text-xs text-slate-400">Search Coordinates</label>
            <div className="flex gap-2 mt-1">
              <input 
                type="text" 
                value={searchCoords} 
                onChange={e => setSearchCoords(e.target.value)}
                placeholder="12.9716, 77.5946" 
                className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded text-xs w-full text-slate-200 focus:outline-none focus:border-cyan-500" 
              />
              <button onClick={handleSearch} className="bg-cyan-600 hover:bg-cyan-500 px-3 rounded text-xs">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Base Map Selector */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
            <label className="text-xs text-slate-400 font-semibold block">Base Map Style</label>
            <select 
              value={activeBaseMap} 
              onChange={(e) => setActiveBaseMap(e.target.value)} 
              className="bg-slate-950 border border-slate-850 px-2 py-1.5 rounded w-full focus:outline-none text-slate-200 text-[11px]"
            >
              <option value="dark">Dark Gotham Map</option>
              <option value="satellite">Satellite Imagery</option>
              <option value="terrain">Terrain Contour Map</option>
            </select>
          </div>

          {/* Heatmap controls */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400 font-semibold">Enable Heatmap</label>
              <input 
                type="checkbox" 
                checked={showHeatmap} 
                onChange={(e) => setShowHeatmap(e.target.checked)} 
                className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-800"
              />
            </div>
            {showHeatmap && (
              <select 
                value={heatmapType} 
                onChange={(e) => setHeatmapType(e.target.value)} 
                className="bg-slate-950 border border-slate-850 px-2 py-1.5 rounded w-full focus:outline-none text-slate-200 text-[11px] mt-1"
              >
                <option value="flood">Flood Density Heatmap</option>
                <option value="population">Population Risk Heatmap</option>
                <option value="pollution">Pollution AQI Heatmap</option>
              </select>
            )}
          </div>

          {/* Follow Location Toggle */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Follow My GPS</span>
              <button 
                onClick={() => setFollowUser(!followUser)} 
                className={`px-2 py-0.5 rounded font-bold font-mono text-[9px] border transition-all ${
                  followUser ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
              >
                {followUser ? 'FOLLOWING' : 'FREE'}
              </button>
            </div>
          </div>

          {/* Telemetry Metrics */}
          {userLocation && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
              <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider font-mono">Live Telemetry Metrics</span>
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                <div className="bg-slate-950/40 p-1.5 border border-slate-850 rounded">
                  <div className="text-[7px] text-slate-500 uppercase leading-none">Speed</div>
                  <div className="text-[10px] font-extrabold text-cyan-400 mt-1">{currentSpeed} <span className="text-[7px] font-normal">km/h</span></div>
                </div>
                <div className="bg-slate-950/40 p-1.5 border border-slate-850 rounded">
                  <div className="text-[7px] text-slate-500 uppercase leading-none">Distance</div>
                  <div className="text-[10px] font-extrabold text-cyan-400 mt-1">{distanceTraveled} <span className="text-[7px] font-normal">km</span></div>
                </div>
                <div className="bg-slate-950/40 p-1.5 border border-slate-850 rounded">
                  <div className="text-[7px] text-slate-500 uppercase leading-none">Heading</div>
                  <div className="text-[10px] font-extrabold text-cyan-400 mt-1 truncate">{currentDirection}</div>
                </div>
              </div>
            </div>
          )}

          {/* Geolocation Section */}
          <div className="pt-3 border-t border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Geolocation Node</span>
              <span className="flex items-center gap-1 text-[9px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse"></span> Active
              </span>
            </div>
            
            {userLocation ? (
              <div className="space-y-2 bg-[#090d16]/50 p-2.5 rounded border border-slate-850">
                <div className="text-[11px] font-bold text-white leading-tight">
                  {userLocation.district}, {userLocation.city}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  {userLocation.state} | {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                </div>
                
                {/* Risk Indicators */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800/40 text-[9px]">
                  <div>
                    <div className="text-slate-500 font-semibold mb-0.5">Flood Zone</div>
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase leading-none inline-block ${
                      isInsideFlood ? 'bg-blue-950 border border-blue-800 text-blue-400' : 'bg-slate-900 border border-slate-850 text-slate-400'
                    }`}>
                      {isInsideFlood ? 'Inside' : 'Safe'}
                    </span>
                  </div>
                  <div>
                    <div className="text-slate-500 font-semibold mb-0.5">Landslide</div>
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase leading-none inline-block ${
                      isInsideLandslide ? 'bg-orange-955 border border-orange-800 text-orange-400' : 'bg-slate-900 border border-slate-850 text-slate-400'
                    }`}>
                      {isInsideLandslide ? 'High' : 'Safe'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-slate-500 font-semibold mb-0.5">Drought</div>
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase leading-none inline-block ${
                      isInsideDrought ? 'bg-pink-950 border border-pink-800 text-pink-400' : 'bg-slate-900 border border-slate-850 text-slate-400'
                    }`}>
                      {isInsideDrought ? 'High' : 'Safe'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-slate-500 font-semibold mb-0.5">Local AQI</div>
                    <span className={`px-1.5 py-0.5 rounded font-bold uppercase leading-none inline-block ${
                      sensorAqi > 200 ? 'bg-red-950 border border-red-800 text-red-400' : sensorAqi > 100 ? 'bg-amber-955 border border-amber-800 text-amber-400' : 'bg-emerald-950 border border-emerald-800 text-emerald-450'
                    }`}>
                      {sensorAqi}
                    </span>
                  </div>
                </div>

                {/* Nearest Shelter */}
                {nearestShelter && (
                  <div className="pt-2 border-t border-slate-800/40 text-[9px] space-y-0.5">
                    <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Nearest Safe Shelter</div>
                    <div className="font-bold text-emerald-450">{(nearestShelter as EmergencyResource).name}</div>
                    <div className="text-slate-350">Distance: {(nearestDistance / 1000).toFixed(2)} km</div>
                    <div className="text-slate-500 font-mono text-[8px]">Contact: {(nearestShelter as EmergencyResource).contact}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-slate-500 italic p-2 bg-[#090d16]/30 rounded border border-dashed border-slate-800 text-center">
                Awaiting GPS coordinate stream lock...
              </div>
            )}
          </div>

          {/* Tracked Sessions */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider font-mono">Tracked Sessions ({onlineCount})</span>
            <div className="space-y-1 max-h-[80px] overflow-y-auto pr-1 scrollbar-thin">
              {Object.keys(activeTrackedUsers || {}).length === 0 ? (
                <div className="text-[9px] text-slate-500 italic">No other sessions.</div>
              ) : (
                Object.keys(activeTrackedUsers || {}).map(uid => (
                  <div key={uid} className="flex justify-between items-center text-[9px] bg-slate-900/60 px-2 py-1 rounded border border-slate-800 font-mono">
                    <span className="font-bold text-slate-300 truncate max-w-[90px]">{uid}</span>
                    <span className="text-[8px] text-cyan-400 bg-cyan-500/10 px-1 rounded">{activeTrackedUsers[uid].speed || 0} km/h</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Telemetry Logs */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider font-mono">Telemetry Feeds</span>
            <div className="bg-black/40 border border-slate-850 p-2 rounded max-h-[100px] overflow-y-auto font-mono text-[8px] text-slate-450 space-y-1 scrollbar-thin flex-1 min-h-[60px]">
              {liveLocationFeed.length === 0 ? (
                <div className="italic text-slate-600">Awaiting WebSocket logs...</div>
              ) : (
                liveLocationFeed.map((feed, idx) => (
                  <div key={idx} className="leading-tight border-b border-slate-900/40 pb-1">{feed}</div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-800/60">
            <span className="text-slate-400 font-semibold block mb-1">Interactive Elements:</span>
            <div className="space-y-1.5 text-slate-300 font-mono text-[10px]">
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-red-500"></div> Pending Citizens reports</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-amber-500"></div> Dispatched assets</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-emerald-500"></div> Relief camps / Shelters</div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-500"></div> User Location (Pulsing)</div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded text-xs border border-slate-800 flex items-start gap-2 text-slate-400 shrink-0">
            <Info className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px]">Draw tools support coordinates bounding box parameters. PostGIS geometric entities are mapped automatically.</p>
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 glass-panel p-2 rounded-lg h-[550px] relative">
          <div ref={mapContainerRef} className="h-full w-full rounded bg-[#090d16] border border-slate-800" style={{ minHeight: '100%' }}></div>
          
          {/* Geofence Warning Banner Overlay */}
          {geofenceAlert && (
            <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-900/90 backdrop-blur border border-red-500 text-white p-3 rounded-lg shadow-2xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-200 shrink-0" />
                <span className="font-bold text-[10px] font-mono tracking-wide">{geofenceAlert}</span>
              </div>
              <button onClick={() => setGeofenceAlert(null)} className="text-white hover:text-red-200 ml-2 cursor-pointer">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Locate Me Floating Action Button */}
          {userLocation && (
            <button 
              onClick={handleLocateMe}
              className="absolute bottom-6 right-6 z-[1000] bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-full shadow-2xl border border-cyan-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              title="Locate Me"
              style={{ width: '40px', height: '40px' }}
            >
              <Navigation className="h-4 w-4 fill-current transform rotate-45" />
            </button>
          )}

          {/* Follow User Floating Action Button */}
          {userLocation && (
            <button 
              onClick={() => setFollowUser(!followUser)}
              className={`absolute bottom-20 right-6 z-[1000] p-3 rounded-full shadow-2xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                followUser ? 'bg-cyan-600 text-white border-cyan-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={followUser ? "Stop Following" : "Follow My Location"}
              style={{ width: '40px', height: '40px' }}
            >
              {followUser ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple fallback alert component to make compile-ready
const AlertCircle = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
