import React from 'react';
import { Truck, ShieldAlert, CheckCircle, Navigation } from 'lucide-react';
import { CitizenReport, EmergencyResource } from '../App';

interface EmergencyProps {
  reports: CitizenReport[];
  resources: EmergencyResource[];
  onDispatch: (resId: string, repId: string) => void;
}

export default function EmergencyManagement({ reports, resources, onDispatch }: EmergencyProps) {
  
  const handleAssign = (repId: string) => {
    const select = document.getElementById(`res-assign-${repId}`) as HTMLSelectElement;
    if (select && select.value) {
      onDispatch(select.value, repId);
      alert(`Resource dispatched successfully for emergency ${repId}!`);
    } else {
      alert("Please select a valid resource.");
    }
  };

  const verifiedReports = reports.filter(r => r.status === 'Verified');
  const standbyResources = resources.filter(r => r.status === 'Standby');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Truck className="text-cyan-400 h-6 w-6" /> Emergency Resource Management
        </h2>
        <p className="text-slate-400 text-sm">Coordinate rescue squads, ambulance units, and shelters across local areas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DISPATCH CONTROLLER */}
        <div className="glass-panel p-5 rounded-lg space-y-4 lg:col-span-1 h-fit">
          <h3 className="text-md font-bold border-b border-slate-800 pb-2 flex items-center gap-2 text-cyan-400">
            <ShieldAlert className="h-4.5 w-4.5" /> Dispatch Console
          </h3>
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1 text-xs">
            {verifiedReports.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">No verified incidents require dispatch at this time.</p>
            ) : (
              verifiedReports.map(rep => (
                <div key={rep.id} className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-cyan-455">{rep.id}</span>
                    <span className="bg-amber-950 text-amber-400 px-1.5 py-0.2 rounded text-[10px]">{rep.type}</span>
                  </div>
                  <p className="font-semibold text-slate-350">{rep.location}</p>
                  <p className="text-[11px] text-slate-400 leading-normal">{rep.desc}</p>
                  
                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-500">Available Responders:</span>
                    {standbyResources.length === 0 ? (
                      <span className="text-[10px] text-red-400">All teams dispatched (0 standby)</span>
                    ) : (
                      <div className="flex gap-1.5">
                        <select id={`res-assign-${rep.id}`} className="bg-slate-950 border border-slate-800 p-1.5 rounded text-xs w-full text-slate-200 focus:outline-none">
                          {standbyResources.map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleAssign(rep.id)}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded font-bold transition flex-shrink-0"
                        >
                          Dispatch
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RESOURCE LIST */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-md font-bold border-b border-slate-800 pb-2">Active Emergency Resources</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-slate-455 border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {resources.map(res => (
                  <tr key={res.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono font-bold text-cyan-400">{res.id}</td>
                    <td className="p-3">{res.name}</td>
                    <td className="p-3">{res.type}</td>
                    <td className="p-3 font-mono text-slate-400">{res.contact}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] ${
                        res.status === 'Standby' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' : 'bg-amber-950 text-amber-400 border border-amber-900/40'
                      }`}>{res.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-center">
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">RESPONSE SPEED</span>
              <span className="text-lg font-bold font-mono text-emerald-400">12.5 mins <span className="text-xs font-normal">Avg</span></span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">RELIABILITY INDEX</span>
              <span className="text-lg font-bold font-mono text-cyan-400">97.8%</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">ACTIVE SHELTERS</span>
              <span className="text-lg font-bold font-mono text-pink-400">2 Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
