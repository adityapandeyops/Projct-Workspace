import React from 'react';
import { 
  Activity, 
  Sparkles, 
  Bed, 
  Clock, 
  Radio, 
  ShieldCheck, 
  Network, 
  ArrowRight,
  HeartPulse
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { AppTab } from './Navbar';

interface HospitalPulseTickerProps {
  onNavigateTab: (tab: AppTab) => void;
}

export const HospitalPulseTicker: React.FC<HospitalPulseTickerProps> = ({ onNavigateTab }) => {
  const { stats } = useHospital();

  const availableBeds = stats?.availableBeds ?? 14;
  const totalBeds = stats?.totalBeds ?? 60;
  const waitTime = stats?.avgWaitTimeMinutes ?? 15;
  const totalPatients = stats?.totalPatientsToday ?? 42;

  const tickerItems = [
    {
      icon: <Sparkles className="w-3.5 h-3.5 text-teal-400" />,
      label: 'AI NEWS2 TRIAGE',
      value: 'Autonomous Priority Active',
      tag: 'REAL-TIME',
      tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    },
    {
      icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
      label: 'AVG WAIT TIME',
      value: `${waitTime} Mins`,
      tag: '3.8X FASTER',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      icon: <Bed className="w-3.5 h-3.5 text-cyan-400" />,
      label: 'BED AVAILABILITY',
      value: `${availableBeds}/${totalBeds} Ready`,
      tag: 'DYNAMIC TURNOVER',
      tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      icon: <Network className="w-3.5 h-3.5 text-indigo-400" />,
      label: 'CITY HEALTH GRID',
      value: '5 Regional Hospitals Synchronized',
      tag: 'SURGE BALANCING',
      tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      icon: <HeartPulse className="w-3.5 h-3.5 text-rose-400" />,
      label: 'TODAY INFLUX',
      value: `${totalPatients} Patients Treated`,
      tag: 'STABLE FLOW',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      icon: <Radio className="w-3.5 h-3.5 text-teal-300" />,
      label: 'VOICE PA ANNOUNCEMENTS',
      value: 'Speech AI Enabled',
      tag: 'MULTILINGUAL',
      tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
    }
  ];

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md overflow-hidden select-none py-1.5 z-40 relative">
      <div className="flex items-center">
        
        {/* Left Fixed Badge */}
        <div className="flex-shrink-0 px-3 sm:px-4 py-0.5 flex items-center space-x-2 border-r border-slate-800 bg-slate-950/90 z-10 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-teal-400 uppercase hidden sm:inline">
            LIVE PULSE
          </span>
        </div>

        {/* Marquee Ticker Track */}
        <div className="overflow-hidden flex-1 relative flex">
          <div className="animate-marquee flex items-center space-x-8 text-xs text-slate-300 pr-8">
            {/* Duplicated for seamless infinite looping */}
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 flex-shrink-0">
                <span className="p-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  {item.icon}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 tracking-wide font-mono">
                  {item.label}:
                </span>
                <span className="text-white font-medium text-[11px]">
                  {item.value}
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${item.tagColor}`}>
                  {item.tag}
                </span>
                <span className="text-slate-700 font-bold ml-3">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Quick Action Links */}
        <div className="flex-shrink-0 px-3 py-0.5 flex items-center space-x-2 border-l border-slate-800 bg-slate-950/90 z-10">
          <button
            onClick={() => onNavigateTab('CITY_NETWORK')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold transition"
          >
            <Network className="w-3 h-3" />
            <span className="hidden md:inline">City Grid</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
