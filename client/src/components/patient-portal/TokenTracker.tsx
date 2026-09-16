import React, { useState } from 'react';
import { 
  Ticket, 
  Clock, 
  MapPin, 
  User, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Share2,
  Printer
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useLanguage } from '../../context/LanguageContext';
import { DigitalSlipModal } from './DigitalSlipModal';

interface TokenTrackerProps {
  onNewRegistration: () => void;
}

export const TokenTracker: React.FC<TokenTrackerProps> = ({ onNewRegistration }) => {
  const { activePatient, patients } = useHospital();
  const { t } = useLanguage();

  const [lookupToken, setLookupToken] = useState('');
  const [searchedPatientId, setSearchedPatientId] = useState<string | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  const displayPatient = searchedPatientId 
    ? patients.find(p => p.id === searchedPatientId) 
    : activePatient || patients[0];

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupToken.trim()) return;
    const found = patients.find(p => p.tokenNumber.toLowerCase() === lookupToken.trim().toLowerCase());
    if (found) {
      setSearchedPatientId(found.id);
    } else {
      alert(`Token #${lookupToken.toUpperCase()} not found. Try searching e.g. TV-OPD-101`);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY':
        return <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 text-xs font-bold shadow-sm shadow-rose-500/20">Emergency Priority</span>;
      case 'URGENT':
        return <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-sm shadow-amber-500/20">Urgent Care</span>;
      case 'ROUTINE':
        return <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-sm shadow-emerald-500/20">Routine OPD</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-sm shadow-cyan-500/20">Fast Track</span>;
    }
  };

  const stagesList = [
    { key: 'REGISTRATION', label: 'Registration', desc: 'Demographics captured' },
    { key: 'TRIAGE', label: 'AI Triage', desc: 'Vitals & NEWS2 score' },
    { key: 'WAITING_OPD', label: 'OPD Queue', desc: 'Waiting for doctor' },
    { key: 'IN_CONSULTATION', label: 'Consultation', desc: 'In doctor chamber' },
    { key: 'DIAGNOSTICS', label: 'Diagnostics', desc: 'Lab & imaging tests' },
    { key: 'PHARMACY', label: 'Pharmacy', desc: 'Medication dispense' },
  ];

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'REGISTRATION': return 0;
      case 'TRIAGE': return 1;
      case 'WAITING_OPD': return 2;
      case 'IN_CONSULTATION': return 3;
      case 'DIAGNOSTICS': return 4;
      case 'PHARMACY': return 5;
      case 'ADMITTED': return 4;
      case 'DISCHARGED': return 6;
      default: return 1;
    }
  };

  if (!displayPatient) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto border border-slate-800">
        <Ticket className="w-12 h-12 text-teal-400 mx-auto animate-bounce-subtle" />
        <h3 className="text-lg font-bold text-white">No Active Patient Token</h3>
        <p className="text-xs text-slate-400">Please register a new patient self check-in or lookup an existing hospital token.</p>
        <button
          onClick={onNewRegistration}
          className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition"
        >
          Go to Self Check-In
        </button>
      </div>
    );
  }

  const currentStageIdx = getStageIndex(displayPatient.stage);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Lookup Bar */}
      <form onSubmit={handleLookup} className="flex gap-2.5 p-2 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Track another token (e.g. TV-OPD-101, TV-ER-001)..."
            value={lookupToken}
            onChange={(e) => setLookupToken(e.target.value)}
            className="w-full pl-4 pr-3 py-2 text-xs text-white placeholder-slate-500 bg-transparent focus:outline-none font-mono uppercase"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition shadow-md shadow-teal-500/20"
        >
          Track Token
        </button>
      </form>

      {/* Main Token Digital Dashboard Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800">
        
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-wider bg-gradient-to-r from-teal-400 via-cyan-200 to-white bg-clip-text text-transparent">
                {displayPatient.tokenNumber}
              </span>
              {getUrgencyBadge(displayPatient.triage.urgency)}
            </div>
            <p className="text-xs text-slate-400 flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{displayPatient.name} ({displayPatient.age}y • {displayPatient.gender})</span>
              <span>•</span>
              <span className="text-teal-400 font-medium">ABHA: {displayPatient.abhaId || '91-4589-2384-9012'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSlipOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print OPD Slip</span>
            </button>
            <button
              onClick={onNewRegistration}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition shadow-md shadow-teal-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Patient</span>
            </button>
          </div>
        </div>

        {/* Live Wait Time & Queue Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Estimated Wait Time</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-white font-mono">
                  {displayPatient.triage.estimatedWaitMinutes}
                </span>
                <span className="text-xs text-teal-400 font-semibold">minutes</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Assigned Chamber</span>
              <span className="text-sm font-bold text-white block truncate">
                {displayPatient.triage.recommendedChamber}
              </span>
              <span className="text-[10px] text-slate-400">{displayPatient.triage.assignedDepartment}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Consulting Doctor</span>
              <span className="text-sm font-bold text-white block truncate">
                {displayPatient.assignedDoctorName || 'Dr. Assigned on Triage'}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Queue Position: #{displayPatient.queuePosition}</span>
            </div>
          </div>

        </div>

        {/* Dynamic Stage Progression Stepper */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Live Clinical Care Progression</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {stagesList.map((st, index) => {
              const isPast = index < currentStageIdx;
              const isCurrent = index === currentStageIdx;

              return (
                <div 
                  key={st.key}
                  className={`p-3 rounded-2xl border transition-all duration-200 ${
                    isCurrent 
                      ? 'bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 border-teal-500/60 shadow-lg shadow-teal-500/15 scale-[1.02]' 
                      : isPast
                      ? 'bg-slate-900/80 border-slate-800 text-slate-400'
                      : 'bg-slate-950/40 border-slate-800/40 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold">0{index + 1}</span>
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                    ) : null}
                  </div>
                  <span className={`text-xs font-bold block ${isCurrent ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'}`}>
                    {st.label}
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate mt-0.5">{st.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Clinical Summary Box */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 space-y-2 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-white">AI Clinical Triage Summary</span>
            </div>
            <span className="text-[10px] font-mono text-teal-400 font-semibold">NEWS2 Early Warning: {displayPatient.triage.news2Score}/14</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {displayPatient.triage.aiClinicalSummary}
          </p>
        </div>

      </div>

      {/* Digital Printable Slip Modal */}
      <DigitalSlipModal
        isOpen={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        patient={displayPatient}
      />

    </div>
  );
};
