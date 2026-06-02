import React from 'react';
import { Leaf, Award, Compass, HelpCircle } from 'lucide-react';

export default function SustainabilityAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Leaf className="text-emerald-400 h-6 w-6" /> Sustainability & SDGs Indicator
        </h2>
        <p className="text-slate-400 text-sm">Measure ecological balances and monitor targets for UN Sustainable Development Goals.</p>
      </div>

      {/* 4 Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* SDG 13 */}
        <div className="glass-panel p-4 rounded-lg flex flex-col justify-between border-l-4 border-emerald-500">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block font-mono">SDG 13 - Climate Action</span>
            <h4 className="text-lg font-bold mt-1 text-white">Resilience Rating</h4>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2">72.4 / 100</div>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 font-mono">+1.8% over last month</span>
        </div>

        {/* SDG 6 */}
        <div className="glass-panel p-4 rounded-lg flex flex-col justify-between border-l-4 border-blue-500">
          <div>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block font-mono">SDG 6 - Clean Water</span>
            <h4 className="text-lg font-bold mt-1 text-white font-display">Water Preserves</h4>
            <div className="text-3xl font-extrabold text-blue-400 mt-2">84.1%</div>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 font-mono">Aquifer level stabilized</span>
        </div>

        {/* Carbon offset */}
        <div className="glass-panel p-4 rounded-lg flex flex-col justify-between border-l-4 border-cyan-500">
          <div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block font-mono">Carbon Index</span>
            <h4 className="text-lg font-bold mt-1 text-white">Carbon Offsets</h4>
            <div className="text-3xl font-extrabold text-cyan-400 mt-2">1,240 <span className="text-xs font-normal text-slate-400">tCO2e</span></div>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 font-mono">Urban plantation offsets</span>
        </div>

        {/* Tree cover */}
        <div className="glass-panel p-4 rounded-lg flex flex-col justify-between border-l-4 border-purple-500">
          <div>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block font-mono">SDG 15 - Life on Land</span>
            <h4 className="text-lg font-bold mt-1 text-white">Canopy Density</h4>
            <div className="text-3xl font-extrabold text-purple-400 mt-2">24.8%</div>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 font-mono">Target: 33.0% density</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ecological list */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-lg space-y-4">
          <h3 className="text-md font-bold border-b border-slate-800 pb-2 flex items-center gap-2">
            <Compass className="h-4.5 w-4.5 text-cyan-455" /> Environmental Actions Initiatives
          </h3>
          
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded border border-slate-800">
              <div className="space-y-1">
                <span className="font-bold text-white">Bangalore Afforestation Drive</span>
                <p className="text-slate-400 text-[10px]">Aims to plant 150k native species trees along river corridors.</p>
              </div>
              <span className="text-emerald-400 font-mono font-bold">42% Complete</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded border border-slate-800">
              <div className="space-y-1">
                <span className="font-bold text-white">Rainwater Harvesting Mandates</span>
                <p className="text-slate-400 text-[10px]">Compliance audits for commercial buildings and municipal properties.</p>
              </div>
              <span className="text-cyan-400 font-mono font-bold">78% Compliant</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded border border-slate-800">
              <div className="space-y-1">
                <span className="font-bold text-white">Industrial Discharges Auditing</span>
                <p className="text-slate-400 text-[10px]">Sensor telemetry to trace untreated wastewater discharge points.</p>
              </div>
              <span className="text-pink-400 font-mono font-bold">24 Audited</span>
            </div>
          </div>
        </div>

        {/* Insight card */}
        <div className="glass-panel p-5 rounded-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-md font-bold text-white flex items-center gap-1.5"><Award className="h-4.5 w-4.5 text-emerald-450" /> ESG Command Insights</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our Climate Resilience Index combines local environmental protection variables, healthcare resource densities, barrier defenses (e.g. levees), and early warning speeds.
            </p>
            <p className="text-xs text-slate-404 leading-relaxed">
              Boosting EWS broadcast speed and checking environmental compliance audits can lift resilience indicators by 4.2 points.
            </p>
          </div>

          <div className="bg-slate-900/80 p-3 rounded border border-slate-800 text-[10px] text-slate-500 font-mono text-center flex items-center justify-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" /> ISO 14001 Standards & SDG Metrics
          </div>
        </div>
      </div>
    </div>
  );
}
