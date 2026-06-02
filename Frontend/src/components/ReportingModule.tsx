import React, { useState } from 'react';
import { FileText, Printer, FileDown } from 'lucide-react';

interface ReportingProps {
  riverLevel: number;
  sensorAqi: number;
  reservoirCapacity: number;
}

export default function ReportingModule({ riverLevel, sensorAqi, reservoirCapacity }: ReportingProps) {
  const [type, setType] = useState("Disaster Summary");
  const [timeframe, setTimeframe] = useState("Last 24 Hours");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <FileText className="text-cyan-400 h-6 w-6" /> Platform Reporting Module
        </h2>
        <p className="text-slate-400 text-sm">Download printable summaries, active logs, and risk audit logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COMPILER CONFIG */}
        <div className="glass-panel p-5 rounded-lg space-y-4 lg:col-span-1 h-fit">
          <h3 className="text-md font-bold border-b border-slate-800 pb-2">Export Configuration</h3>
          
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Report Category</label>
              <select 
                value={type} onChange={e => setType(e.target.value)}
                className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-slate-200 focus:outline-none"
              >
                <option>Disaster Summary</option>
                <option>Environmental Sensor Logs</option>
                <option>Risk Assessment Audit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Timeframe Coverage</label>
              <select 
                value={timeframe} onChange={e => setTimeframe(e.target.value)}
                className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-slate-200 focus:outline-none"
              >
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Output Type</label>
              <select className="bg-slate-950 border border-slate-850 p-2 rounded w-full text-slate-200 focus:outline-none">
                <option>Adobe PDF (.pdf)</option>
                <option>CSV Dataset (.csv)</option>
              </select>
            </div>

            <button 
              onClick={handlePrint}
              className="bg-cyan-600 hover:bg-cyan-550 text-white w-full py-2.5 rounded font-bold transition flex items-center justify-center gap-1.5"
            >
              <Printer className="h-4 w-4" /> Print PDF Report
            </button>
          </div>
        </div>

        {/* PAPER PREVIEW */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-lg bg-white text-slate-900 border border-slate-350 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
            <div>
              <h4 className="text-md font-bold tracking-tight uppercase font-display">EcoShield Climate Report</h4>
              <p className="text-[10px] text-slate-500 font-mono">Issued by: Bangalore Disaster Control Authority</p>
            </div>
            <FileDown className="text-cyan-700 h-8 w-8" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-[10px] uppercase text-slate-400 font-mono block">Report Category:</span>
              <p className="font-semibold text-slate-800">{type}</p>
            </div>
            <div>
              <span className="font-bold text-[10px] uppercase text-slate-400 font-mono block">Generation Stamp:</span>
              <p className="font-semibold text-slate-800">{new Date().toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 text-xs space-y-2">
            <span className="font-bold text-[10px] uppercase text-slate-400 font-mono block">Document Narrative Summary:</span>
            <p className="text-slate-600 leading-relaxed">
              This document compiles verified telemetry feeds from regional hydrological, climate, and air-quality monitoring nodes over the <b>{timeframe}</b> timeframe. 
              Average hazard variables remained elevated due to the River Bellandur elevation level measuring <b>{riverLevel}m</b>.
            </p>
            
            <table className="w-full text-left text-[11px] text-slate-700 border-collapse mt-4">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="p-2">Sensor Point</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Avg Value</th>
                  <th className="p-2">Threshold Limit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-mono">Bellandur S-401</td>
                  <td className="p-2">Depth Gauge</td>
                  <td className="p-2 font-mono">{riverLevel}m</td>
                  <td className="p-2 font-mono text-red-600">48.8m</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-mono">Bangalore S-402</td>
                  <td className="p-2">AQI Meter</td>
                  <td className="p-2 font-mono">{sensorAqi} AQI</td>
                  <td className="p-2 font-mono text-red-650">200 AQI</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2 font-mono">Reservoir S-403</td>
                  <td className="p-2">Level Gauge</td>
                  <td className="p-2 font-mono">{reservoirCapacity.toFixed(1)}%</td>
                  <td className="p-2 font-mono text-amber-600 font-bold">30% (Low)</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="pt-6 text-center text-[10px] text-slate-400 border-t border-slate-100 font-mono">
            Official document of the Government-grade Environmental Command Center. Verified by AI prediction modules.
          </div>
        </div>
      </div>
    </div>
  );
}
