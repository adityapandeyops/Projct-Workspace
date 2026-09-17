import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  BarChart3, 
  Bed, 
  ShieldCheck, 
  Flame, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  ArrowUpRight,
  Zap,
  Sliders,
  Network
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { CongestionHeatmap } from './CongestionHeatmap';
import { AIResourceRecommendations } from './AIResourceRecommendations';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { BedManagementCard } from './BedManagementCard';
import { AdminManagementPanel } from './AdminManagementPanel';
import { CityHospitalNetwork } from '../city-network/CityHospitalNetwork';

export const CommandCenterDashboard: React.FC = () => {
  const { stats, recommendations, activeBroadcasts } = useHospital();
  const [activeSubView, setActiveSubView] = useState<'HEATMAP' | 'RECOMMENDATIONS' | 'CITY_GRID' | 'ANALYTICS' | 'BEDS' | 'ADMIN'>('HEATMAP');


  const pendingRecommendations = recommendations.filter(r => !r.isExecuted);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      
      {/* Active Emergency Broadcasts Banner */}
      {activeBroadcasts && activeBroadcasts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 flex items-center justify-between gap-3 text-xs shadow-lg shadow-rose-500/10 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <Radio className="w-5 h-5 text-rose-400 animate-pulse flex-shrink-0" />
            <div>
              <span className="font-bold text-white block">{activeBroadcasts[0].title}</span>
              <span className="text-rose-200/90 text-xs">{activeBroadcasts[0].message}</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-rose-500/20 font-mono font-bold text-[10px] text-rose-300 border border-rose-500/30 uppercase">
            {activeBroadcasts[0].code}
          </span>
        </div>
      )}

      {/* Top Level Hospital KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Active OPD Influx */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active Hospital Influx</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
            {stats?.totalPatientsToday ?? 0} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14% dynamic surge</span>
          </div>
        </div>

        {/* Metric 2: Average Wait Time */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Average Wait Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
            {stats?.avgWaitTimeMinutes ?? 16} <span className="text-xs font-normal text-slate-400">mins</span>
          </div>
          <div className="text-[11px] text-teal-400 font-medium">
            AI Dynamic Triage Active
          </div>
        </div>

        {/* Metric 3: Bed Occupancy Rate */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Ward Bed Occupancy</span>
            <Bed className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
            {stats?.overallBedOccupancyPercent ?? 75}%
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            <span className="text-emerald-400 font-bold">{stats?.availableBeds ?? 0}</span> of {stats?.totalBeds ?? 0} Beds Available
          </div>
        </div>

        {/* Metric 4: AI Recommendations */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>AI Resource Insights</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-teal-300 tracking-tight">
            {pendingRecommendations.length} <span className="text-xs font-normal text-slate-400">pending</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            Autonomous Balancer Online
          </div>
        </div>

      </div>

      {/* Segmented Sub-Navigation Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex items-center space-x-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl overflow-x-auto max-w-full">
          
          <button
            onClick={() => setActiveSubView('HEATMAP')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
              activeSubView === 'HEATMAP' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25 scale-[1.02]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Congestion Heatmap</span>
          </button>

          <button
            onClick={() => setActiveSubView('RECOMMENDATIONS')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
              activeSubView === 'RECOMMENDATIONS' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25 scale-[1.02]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Resource Allocator</span>
            {pendingRecommendations.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveSubView('CITY_GRID')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
              activeSubView === 'CITY_GRID' 
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/25 scale-[1.02]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Regional City Grid</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-[9px] font-black text-indigo-300">
              5 Hosps
            </span>
          </button>

          <button
            onClick={() => setActiveSubView('ANALYTICS')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
              activeSubView === 'ANALYTICS' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25 scale-[1.02]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & Forecasts</span>
          </button>

          <button
            onClick={() => setActiveSubView('BEDS')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
              activeSubView === 'BEDS' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25 scale-[1.02]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bed className="w-4 h-4" />
            <span>Ward Bed Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubView('ADMIN')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
              activeSubView === 'ADMIN' 
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25 scale-[1.02]' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Console</span>
          </button>

        </div>
      </div>

      {/* View Panels */}
      <div>
        {activeSubView === 'HEATMAP' && <CongestionHeatmap />}
        {activeSubView === 'RECOMMENDATIONS' && <AIResourceRecommendations />}
        {activeSubView === 'CITY_GRID' && <CityHospitalNetwork />}
        {activeSubView === 'ANALYTICS' && <AnalyticsDashboard />}
        {activeSubView === 'BEDS' && <BedManagementCard />}
        {activeSubView === 'ADMIN' && <AdminManagementPanel />}
      </div>

    </div>
  );
};
