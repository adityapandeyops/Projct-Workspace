import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  Zap, 
  ChevronUp, 
  ChevronDown, 
  X,
  Compass
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { AppTab } from '../navbar/Navbar';
import { announceTokenCall, playQueueChime } from '../../utils/soundAlerts';

interface LiveShowcaseHUDProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  onOpenSurgeModal: () => void;
}

export const LiveShowcaseHUD: React.FC<LiveShowcaseHUDProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSurgeModal
}) => {
  const { activePatient } = useHospital();

  const [isOpen, setIsOpen] = useState(false);
  const [isAutoTourRunning, setIsAutoTourRunning] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps = [
    {
      tab: 'PATIENT' as AppTab,
      title: '1. AI Health Screening & Fast-Track Token',
      desc: 'Patients receive preventive risk scoring and instant token generation under 15-min wait.'
    },
    {
      tab: 'COMMAND_CENTER' as AppTab,
      title: '2. Real-Time Command Center & AI Triage',
      desc: 'Predictive NEWS2 vital scoring and autonomous congestion balancing across departments.'
    },
    {
      tab: 'CITY_NETWORK' as AppTab,
      title: '3. Regional City Hospital Grid & Radar',
      desc: '5 regional partner hospitals synchronized to reroute ambulances and offload surge.'
    },
    {
      tab: 'DOCTOR' as AppTab,
      title: '4. Clinical Station & Voice AI Calling',
      desc: 'Doctors call next patients with synthesizer chimes and speech synthesis broadcast.'
    },
    {
      tab: 'ADMIN' as AppTab,
      title: '5. Bed Turnover & Resource Governance',
      desc: 'Autonomous bed cleaning workflows and audit telemetry.'
    }
  ];

  // Auto-tour runner effect
  useEffect(() => {
    let timer: any;
    if (isAutoTourRunning) {
      timer = setTimeout(() => {
        setTourStep(prev => {
          const next = (prev + 1) % tourSteps.length;
          setCurrentTab(tourSteps[next].tab);
          playQueueChime();
          return next;
        });
      }, 7000);
    }
    return () => clearTimeout(timer);
  }, [isAutoTourRunning, tourStep]);

  const toggleAutoTour = () => {
    if (!isAutoTourRunning) {
      setIsAutoTourRunning(true);
      setCurrentTab(tourSteps[tourStep].tab);
      playQueueChime();
    } else {
      setIsAutoTourRunning(false);
    }
  };

  const handleTestVoicePA = () => {
    announceTokenCall({
      tokenNumber: activePatient ? activePatient.tokenNumber : 'TV-OPD-104',
      chamberNumber: '102',
      doctorName: 'Dr. Rajesh Sharma',
      patientName: activePatient ? activePatient.name : 'Priya Verma',
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      
      {/* Expanded Showcase Control Panel */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl bg-slate-950/95 border border-teal-500/40 shadow-2xl p-5 backdrop-blur-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-teal-500/20 text-teal-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white font-mono tracking-wider">LIVE SHOWCASE HUD</h4>
                <p className="text-[10px] text-slate-400">Interactive Demo & Feature Tour</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Auto Tour Mode */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                <span>Auto-Demo Walkthrough</span>
              </span>
              <button
                onClick={toggleAutoTour}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1 transition ${
                  isAutoTourRunning 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20'
                }`}
              >
                {isAutoTourRunning ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Pause Tour</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Start Tour</span>
                  </>
                )}
              </button>
            </div>

            {isAutoTourRunning && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono font-bold text-teal-400 block truncate">
                  {tourSteps[tourStep].title}
                </span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {tourSteps[tourStep].desc}
                </p>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-2">
                  <div 
                    className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${((tourStep + 1) / tourSteps.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 gap-2">
            
            <button
              onClick={handleTestVoicePA}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-left text-xs space-y-1 transition group"
            >
              <div className="flex items-center space-x-1.5 text-teal-400 font-semibold">
                <Volume2 className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                <span>Test Voice PA</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Synthesizer Chime + AI Speech</span>
            </button>

            <button
              onClick={onOpenSurgeModal}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left text-xs space-y-1 transition group"
            >
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                <Zap className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                <span>Simulate Surge</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Mass Casualty / Festival Surge</span>
            </button>

          </div>

          {/* Navigation Quick Jump */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500">Quick Portal Switch</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { tab: 'PATIENT' as AppTab, label: 'Patient' },
                { tab: 'COMMAND_CENTER' as AppTab, label: 'Command' },
                { tab: 'CITY_NETWORK' as AppTab, label: 'City Grid' },
                { tab: 'DOCTOR' as AppTab, label: 'Doctor' },
                { tab: 'ADMIN' as AppTab, label: 'Admin' },
              ].map((btn) => (
                <button
                  key={btn.tab}
                  onClick={() => {
                    setCurrentTab(btn.tab);
                    setIsAutoTourRunning(false);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition ${
                    currentTab === btn.tab
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 text-slate-950 font-black text-xs shadow-2xl shadow-teal-500/40 hover:scale-105 active:scale-95 transition duration-200"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
        </span>
        <Sparkles className="w-4 h-4 animate-spin-slow" />
        <span>{isOpen ? 'Close Demo HUD' : 'Live Showcase Tour'}</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

    </div>
  );
};
