import React, { useState } from 'react';
import { Users, Upload, ShieldAlert, Check, X } from 'lucide-react';
import { CitizenReport } from '../App';

interface CitizenProps {
  reports: CitizenReport[];
  onSubmit: (report: {
    name: string;
    phone: string;
    type: string;
    location: string;
    lat: number;
    lng: number;
    desc: string;
    image: string;
  }) => void;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
}

export default function CitizenReporting({ reports, onSubmit, onVerify, onReject }: CitizenProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("Flood");
  const [location, setLocation] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !desc) {
      alert("Name, Location, and Description are required.");
      return;
    }

    // Random coordinates around Bangalore
    const offsetLat = (Math.random() - 0.5) * 0.1;
    const offsetLng = (Math.random() - 0.5) * 0.1;

    onSubmit({
      name,
      phone: phone || "+91 99999 88888",
      type,
      location,
      lat: 12.940 + offsetLat,
      lng: 77.600 + offsetLng,
      desc,
      image: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=300&q=80"
    });

    // Reset Form
    setName("");
    setPhone("");
    setLocation("");
    setDesc("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users className="text-cyan-400 h-6 w-6" /> Citizen Reporting Portal
        </h2>
        <p className="text-slate-400 text-sm">Submit community emergencies or review citizens' active reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* REPORT FORM */}
        <div className="glass-panel p-5 rounded-lg space-y-4 lg:col-span-1 h-fit">
          <h3 className="text-md font-bold border-b border-slate-800 pb-2 flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-cyan-400" /> Submit Incident Report
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Your Name *</label>
              <input 
                type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Ramesh Sharma" className="bg-slate-950 border border-slate-800 p-2 rounded w-full text-slate-200 focus:outline-none focus:border-cyan-500" 
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Contact Phone</label>
              <input 
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210" className="bg-slate-950 border border-slate-800 p-2 rounded w-full text-slate-200 focus:outline-none" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Incident Type</label>
              <select 
                value={type} onChange={e => setType(e.target.value)}
                className="bg-slate-950 border border-slate-800 p-2 rounded w-full text-slate-200 focus:outline-none"
              >
                <option>Flood</option>
                <option>Fire</option>
                <option>Pollution</option>
                <option>Water Leakage</option>
                <option>Landslide</option>
                <option>Tree Fall</option>
                <option>Heatwave Emergency</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Location Address *</label>
              <input 
                type="text" required value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Bangalore City Sector 4" className="bg-slate-950 border border-slate-800 p-2 rounded w-full text-slate-200 focus:outline-none" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Description *</label>
              <textarea 
                required value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="State the urgency levels and details..." rows={3} className="bg-slate-950 border border-slate-800 p-2 rounded w-full text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Media Attachment</label>
              <div className="border border-dashed border-slate-800 rounded p-4 text-center cursor-pointer hover:border-cyan-500/40 transition">
                <Upload className="h-5 w-5 text-slate-500 mx-auto mb-1" />
                <p className="text-[10px] text-slate-455">Upload incident photos/videos</p>
              </div>
            </div>

            <button type="submit" className="bg-cyan-600 hover:bg-cyan-550 text-white w-full py-2.5 rounded font-bold transition">
              Submit Report
            </button>
          </form>
        </div>

        {/* VERIFICATION QUEUE */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-md font-bold">Verification Control Queue</h3>
            <span className="text-xs bg-slate-850 text-slate-300 px-2 py-0.5 rounded font-mono">
              {reports.filter(r => r.status === 'Pending').length} Pending
            </span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {reports.map(rep => (
              <div key={rep.id} className="p-4 rounded bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row justify-between gap-4 text-xs">
                <div className="flex gap-4">
                  <img src={rep.image} alt={rep.type} className="w-20 h-20 object-cover rounded border border-slate-800 flex-shrink-0" />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">{rep.id}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] ${
                        rep.type === 'Flood' ? 'bg-blue-900/60 text-blue-300' :
                        rep.type === 'Fire' ? 'bg-red-900/60 text-red-300' :
                        rep.type === 'Pollution' ? 'bg-emerald-900/60 text-emerald-300' :
                        'bg-amber-900/60 text-amber-300'
                      }`}>{rep.type}</span>
                      <span className="text-slate-500 text-[10px] font-mono">{rep.time}</span>
                    </div>
                    <p className="text-slate-300 font-semibold">{rep.location}</p>
                    <p className="text-slate-400">{rep.desc}</p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      By: {rep.name} | {rep.phone}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                    rep.status === 'Pending' ? 'bg-red-950 text-red-400 border border-red-900/40' :
                    rep.status === 'Verified' ? 'bg-amber-950 text-amber-400 border border-amber-900/40' :
                    rep.status === 'Assigned' ? 'bg-blue-950 text-blue-400 border border-blue-900/40' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                  }`}>{rep.status}</span>

                  {rep.status === 'Pending' && (
                    <div className="flex gap-1.5 mt-2">
                      <button 
                        onClick={() => onVerify(rep.id)}
                        className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-3 py-1 rounded font-bold transition flex items-center gap-1">
                        <Check className="h-3 w-3" /> Approve
                      </button>
                      <button 
                        onClick={() => onReject(rep.id)}
                        className="bg-red-950/60 hover:bg-red-900 text-red-300 px-3 py-1 rounded font-bold transition flex items-center gap-1">
                        <X className="h-3 w-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
