import React, { useState } from 'react';
import { 
  Network, 
  Hospital, 
  Ambulance, 
  Bed, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Radio, 
  Sliders, 
  MapPin, 
  ShieldCheck, 
  TrendingUp,
  Share2,
  Zap,
  PhoneCall
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { playQueueChime, playEmergencyAlertSound } from '../../utils/soundAlerts';

interface PartnerHospital {
  id: string;
  name: string;
  distanceKm: number;
  type: string;
  erWaitMinutes: number;
  bedOccupancyPercent: number;
  availableBeds: number;
  totalBeds: number;
  icuAvailable: number;
  status: 'OPTIMAL' | 'MODERATE' | 'SURGE' | 'CRITICAL';
  statusDescription: string;
  inboundAmbulances: number;
  recommendedAction: string;
  coordinates: { x: number; y: number }; // Percentage on visual radar
}

export const CityHospitalNetwork: React.FC = () => {
  const { stats, triggerSimulation, broadcastAlert } = useHospital();

  const [activeHospitalId, setActiveHospitalId] = useState<string>('tech-voyager');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);

  const [hospitals, setHospitals] = useState<PartnerHospital[]>([
    {
      id: 'tech-voyager',
      name: 'Tech Voyager Central (Host Facility)',
      distanceKm: 0,
      type: 'AI Apex Center & Multispecialty',
      erWaitMinutes: stats?.avgWaitTimeMinutes || 15,
      bedOccupancyPercent: stats?.overallBedOccupancyPercent || 74,
      availableBeds: stats?.availableBeds || 16,
      totalBeds: stats?.totalBeds || 60,
      icuAvailable: 4,
      status: 'OPTIMAL',
      statusDescription: 'AI Dynamic Triage balancing all departmental queues',
      inboundAmbulances: 2,
      recommendedAction: 'Receiving diverted overflow from North Corridor',
      coordinates: { x: 50, y: 50 }
    },
    {
      id: 'aiims-metro',
      name: 'AIIMS Metro Trauma Center',
      distanceKm: 4.2,
      type: 'State Level 1 Trauma Facility',
      erWaitMinutes: 84,
      bedOccupancyPercent: 97,
      availableBeds: 3,
      totalBeds: 120,
      icuAvailable: 0,
      status: 'CRITICAL',
      statusDescription: 'Massive emergency backlog due to expressway collision',
      inboundAmbulances: 7,
      recommendedAction: 'Divert 6 non-trauma inbound ambulances to Tech Voyager',
      coordinates: { x: 28, y: 24 }
    },
    {
      id: 'fortis-east',
      name: 'Fortis East Specialty Hospital',
      distanceKm: 6.5,
      type: 'Private Tertiary & Cardiology Institute',
      erWaitMinutes: 44,
      bedOccupancyPercent: 86,
      availableBeds: 14,
      totalBeds: 100,
      icuAvailable: 2,
      status: 'MODERATE',
      statusDescription: 'Cardiology ICU at 90% capacity; General ward stable',
      inboundAmbulances: 3,
      recommendedAction: 'Coordinate reciprocal ICU bed reservation standby',
      coordinates: { x: 74, y: 32 }
    },
    {
      id: 'st-jude-west',
      name: 'St. Jude Suburban Health & Clinic',
      distanceKm: 8.9,
      type: 'Suburban Community & Daycare Hospital',
      erWaitMinutes: 12,
      bedOccupancyPercent: 48,
      availableBeds: 38,
      totalBeds: 75,
      icuAvailable: 7,
      status: 'OPTIMAL',
      statusDescription: 'Surplus capacity ready to accept fast-track OPD offload',
      inboundAmbulances: 0,
      recommendedAction: 'Preferred destination for routine OPD tele-diversions',
      coordinates: { x: 22, y: 76 }
    },
    {
      id: 'max-city-south',
      name: 'Max City Outpatient & Diagnostics',
      distanceKm: 11.2,
      type: 'Surgical Daycare & Diagnostic Hub',
      erWaitMinutes: 22,
      bedOccupancyPercent: 62,
      availableBeds: 19,
      totalBeds: 50,
      icuAvailable: 3,
      status: 'OPTIMAL',
      statusDescription: 'Elective surgeries on schedule; MRI & CT scanners open',
      inboundAmbulances: 1,
      recommendedAction: 'Offload routine MRI/CT queues to free hospital scanners',
      coordinates: { x: 78, y: 74 }
    }
  ]);

  const activeHospital = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];

  const triggerActionNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    playQueueChime();
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4500);
  };

  // Action 1: Reroute Ambulances from Surging Hospital to Tech Voyager
  const handleAmbulanceDiversion = () => {
    setIsTransferring(true);
    setTimeout(() => {
      setHospitals(prev => prev.map(h => {
        if (h.id === 'aiims-metro') {
          return { ...h, inboundAmbulances: Math.max(1, h.inboundAmbulances - 4), erWaitMinutes: 62, status: 'SURGE' };
        }
        if (h.id === 'tech-voyager') {
          return { ...h, inboundAmbulances: h.inboundAmbulances + 4, availableBeds: Math.max(4, h.availableBeds - 2) };
        }
        return h;
      }));
      setIsTransferring(false);
      triggerActionNotification('Autonomous Diversion Active: 4 Ambulances safely rerouted from AIIMS to Tech Voyager AI ER.');
    }, 1200);
  };

  // Action 2: Routine OPD Fast-Track Offload to St. Jude Suburban
  const handleOPDOffload = () => {
    setIsTransferring(true);
    setTimeout(() => {
      setHospitals(prev => prev.map(h => {
        if (h.id === 'st-jude-west') {
          return { ...h, bedOccupancyPercent: 56, erWaitMinutes: 18 };
        }
        if (h.id === 'tech-voyager') {
          return { ...h, erWaitMinutes: 11 };
        }
        return h;
      }));
      setIsTransferring(false);
      triggerActionNotification('Regional Grid Balance: 15 Routine OPD cases transferred to St. Jude Suburban Clinic. Tech Voyager wait dropped to 11m!');
    }, 1200);
  };

  // Action 3: Broadcast Regional Emergency Advisory
  const handleBroadcastRegionalAlert = async () => {
    playEmergencyAlertSound();
    await broadcastAlert({
      code: 'CODE_YELLOW',
      title: 'REGIONAL HEALTH GRID CODE YELLOW',
      message: 'Surge Alert: Metro Expressway accident. Tech Voyager activated Level-1 mass casualty intake protocol with city grid.',
      targetWards: ['EMERGENCY', 'ICU', 'TRIAGE']
    });
    triggerActionNotification('Code Yellow Emergency Advisory broadcasted to all 5 interconnected hospitals in Metro Cluster.');
  };

  const getStatusBadge = (status: PartnerHospital['status']) => {
    switch (status) {
      case 'CRITICAL':
        return <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold animate-pulse">Critical Surge</span>;
      case 'SURGE':
        return <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">Elevated Load</span>;
      case 'MODERATE':
        return <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold">Moderate Capacity</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">Optimal Flow</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold tracking-wide">
              <Network className="w-3.5 h-3.5 animate-pulse" />
              <span>INTER-HOSPITAL RESOURCE BALANCING & CITY GRID</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Metropolitan Hospital Exchange Network
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Real-time synchronization across 5 regional partner hospitals. Autonomous ambulance rerouting, ICU bed reservations, and cross-facility surge diversion prevent bottlenecks before they occur.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-2xl font-black font-mono text-indigo-400">5</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Synced Hospitals</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-2xl font-black font-mono text-teal-300">90 Beds</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Grid Capacity</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-2xl font-black font-mono text-amber-300">13</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Ambulances</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-teal-500/15 border border-teal-500/40 text-teal-200 text-xs flex items-center justify-between shadow-lg shadow-teal-500/10 backdrop-blur-xl animate-in fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <span className="font-semibold">{actionSuccessMessage}</span>
          </div>
          <span className="text-[10px] font-mono text-teal-400 uppercase">Live Updated</span>
        </div>
      )}

      {/* Main Grid: Visual Radar & Hospital Detail Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: High-Tech Animated Radar Map (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 space-y-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
              <h3 className="text-sm font-bold text-white font-mono tracking-wider">
                REGIONAL SURGE RADAR & INTER-HOSPITAL TELEMETRY
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Range: 15 km Radius</span>
          </div>

          {/* Interactive Radar Visualizer */}
          <div className="relative w-full aspect-square max-h-[460px] mx-auto rounded-3xl bg-slate-950 border border-slate-800/90 overflow-hidden flex items-center justify-center p-4">
            
            {/* Concentric Radar Distance Rings */}
            <div className="absolute w-[85%] h-[85%] rounded-full border border-slate-800/80 pointer-events-none" />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-slate-800/60 pointer-events-none" />
            <div className="absolute w-[35%] h-[35%] rounded-full border border-slate-800/40 pointer-events-none" />
            <div className="absolute w-full h-[1px] bg-slate-800/40 pointer-events-none" />
            <div className="absolute h-full w-[1px] bg-slate-800/40 pointer-events-none" />

            {/* Rotating Radar Sweep Line */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-full animate-radar-sweep opacity-30 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_310deg,rgba(99,102,241,0.4)_360deg)] rounded-full" />
            </div>

            {/* Inter-Hospital Connecting Vector Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {hospitals.filter(h => h.id !== 'tech-voyager').map(h => (
                <line
                  key={h.id}
                  x1="50%"
                  y1="50%"
                  x2={`${h.coordinates.x}%`}
                  y2={`${h.coordinates.y}%`}
                  stroke={h.status === 'CRITICAL' ? '#f43f5e' : '#6366f1'}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.4"
                />
              ))}
            </svg>

            {/* Hospital Nodes on Radar */}
            {hospitals.map(h => {
              const isSelected = h.id === activeHospitalId;
              const isHost = h.id === 'tech-voyager';

              return (
                <button
                  key={h.id}
                  onClick={() => setActiveHospitalId(h.id)}
                  style={{ left: `${h.coordinates.x}%`, top: `${h.coordinates.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-2xl transition-all duration-300 group z-20 ${
                    isSelected 
                      ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 scale-125 shadow-xl shadow-indigo-500/50 ring-4 ring-indigo-400/40' 
                      : isHost
                      ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/40'
                      : h.status === 'CRITICAL'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/40 animate-pulse'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:scale-110 hover:border-indigo-400'
                  }`}
                  title={`${h.name} (${h.distanceKm} km)`}
                >
                  <Hospital className="w-5 h-5" />
                  
                  {/* Floating Tag */}
                  <span className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase transition ${
                    isSelected 
                      ? 'bg-white text-slate-950 shadow-md font-extrabold' 
                      : 'bg-slate-900/90 text-slate-300 border border-slate-800'
                  }`}>
                    {h.name.split(' ')[0]} • {h.erWaitMinutes}m
                  </span>
                </button>
              );
            })}

          </div>

          {/* Radar Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <span>Host (Tech Voyager)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Critical Backlog</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Partner Facility</span>
              </span>
            </div>
            <span className="text-teal-400 font-mono font-semibold">Active Sync: 100% Reliability</span>
          </div>

        </div>

        {/* Right Col: Selected Hospital Telemetry & Cross-Facility Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="glass-panel rounded-3xl p-6 space-y-5 border border-slate-800">
            
            {/* Header */}
            <div className="space-y-1 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                  {activeHospital.distanceKm === 0 ? 'HOST FACILITY' : `${activeHospital.distanceKm} KM DISTANCE`}
                </span>
                {getStatusBadge(activeHospital.status)}
              </div>
              <h3 className="text-lg font-black text-white">{activeHospital.name}</h3>
              <p className="text-xs text-slate-400">{activeHospital.type}</p>
            </div>

            {/* Vital Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>ER Wait Time</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {activeHospital.erWaitMinutes} <span className="text-xs font-normal text-slate-500">mins</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {activeHospital.erWaitMinutes <= 20 ? 'Optimal fast-track' : 'High queue delay'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Bed Availability</span>
                  <Bed className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {activeHospital.availableBeds} <span className="text-xs font-normal text-slate-500">/{activeHospital.totalBeds}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {activeHospital.bedOccupancyPercent}% Occupied
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>ICU Ready Beds</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-black font-mono text-emerald-400">
                  {activeHospital.icuAvailable} <span className="text-xs font-normal text-slate-500">available</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Ventilator linked
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Ambulance Influx</span>
                  <Ambulance className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {activeHospital.inboundAmbulances} <span className="text-xs font-normal text-slate-500">en route</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  GPS tracker active
                </div>
              </div>

            </div>

            {/* AI Recommendation Box */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold font-mono">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI CITY GRID RECOMMENDATION</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeHospital.recommendedAction}
              </p>
            </div>

            {/* Coordination Action CTAs */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleAmbulanceDiversion}
                disabled={isTransferring}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs tracking-wide shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Ambulance className="w-4 h-4 fill-slate-950" />
                <span>{isTransferring ? 'Routing Influx...' : 'Initiate Dynamic Ambulance Diversion'}</span>
              </button>

              <button
                onClick={handleOPDOffload}
                disabled={isTransferring}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Offload Routine OPD to Suburban Clinic</span>
              </button>

              <button
                onClick={handleBroadcastRegionalAlert}
                className="w-full py-2.5 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Broadcast Regional Code Yellow Advisory</span>
              </button>
            </div>

          </div>

          {/* Network Partner Quick List */}
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Quick Regional Hospital Directory
            </span>
            <div className="space-y-2">
              {hospitals.map(h => (
                <button
                  key={h.id}
                  onClick={() => setActiveHospitalId(h.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition ${
                    h.id === activeHospitalId
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="truncate max-w-[200px]">
                    <span className="font-semibold block truncate text-slate-200">{h.name}</span>
                    <span className="text-[10px] text-slate-500">{h.distanceKm === 0 ? 'Host Center' : `${h.distanceKm} km away`}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-teal-400">{h.erWaitMinutes}m</span>
                    <span className="block text-[9px] text-slate-500">Wait</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
