import React, { useState } from 'react';
import { 
  Users, 
  Stethoscope, 
  Clock, 
  Pill, 
  TestTubes, 
  LogOut, 
  Bed, 
  CheckCircle2, 
  Play,
  ArrowRight,
  Sparkles,
  Zap,
  Volume2
} from 'lucide-react';
import { Patient, Doctor, DepartmentType } from '../../types';
import { useHospital } from '../../context/HospitalContext';
import { AIClinicalAssistant } from './AIClinicalAssistant';
import { PrescriptionEditorModal } from './PrescriptionEditorModal';
import { announceTokenCall } from '../../utils/soundAlerts';

interface DoctorQueueManagerProps {
  selectedDoctor: Doctor | null;
  onSelectDoctor: (doc: Doctor) => void;
}

export const DoctorQueueManager: React.FC<DoctorQueueManagerProps> = ({ selectedDoctor, onSelectDoctor }) => {
  const { patients, doctors, updatePatientStage } = useHospital();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  const activeConsultationPatient = patients.find(p => 
    p.stage === 'IN_CONSULTATION' && 
    (!selectedDoctor || p.assignedDoctorId === selectedDoctor.id || p.triage.assignedDepartment === selectedDoctor.department)
  );

  const waitingQueue = patients.filter(p => 
    (p.stage === 'WAITING_OPD' || p.stage === 'TRIAGE') &&
    (!selectedDoctor || p.triage.assignedDepartment === selectedDoctor.department)
  ).sort((a, b) => b.triage.priorityScore - a.triage.priorityScore);

  const diagnosticsQueue = patients.filter(p => 
    p.stage === 'DIAGNOSTICS' &&
    (!selectedDoctor || p.triage.assignedDepartment === selectedDoctor.department)
  );

  const activePatientForAssistant = patients.find(p => p.id === selectedPatientId) || activeConsultationPatient || waitingQueue[0];

  const handleCallNext = async () => {
    if (waitingQueue.length === 0) return;
    const nextPatient = waitingQueue[0];
    await updatePatientStage(nextPatient.id, 'IN_CONSULTATION', {
      assignedDoctorId: selectedDoctor?.id,
      assignedDoctorName: selectedDoctor?.name,
    });
    setSelectedPatientId(nextPatient.id);

    // Trigger hospital chime + voice announcement
    announceTokenCall({
      tokenNumber: nextPatient.tokenNumber,
      chamberNumber: selectedDoctor?.chamberNumber || nextPatient.triage.recommendedChamber,
      doctorName: selectedDoctor?.name,
      patientName: nextPatient.name,
      language: nextPatient.languagePreference || 'en'
    });
  };

  const handleSendToDiagnostics = async (patientId: string) => {
    await updatePatientStage(patientId, 'DIAGNOSTICS');
  };

  const handleSendToPharmacy = async (patientId: string) => {
    await updatePatientStage(patientId, 'PHARMACY');
  };

  const handleDischarge = async (patientId: string) => {
    await updatePatientStage(patientId, 'DISCHARGED');
    if (selectedPatientId === patientId) setSelectedPatientId(null);
  };

  const handleAdmit = async (patientId: string) => {
    await updatePatientStage(patientId, 'ADMITTED');
  };

  const getUrgencyPill = (urgency: Patient['triage']['urgency']) => {
    switch (urgency) {
      case 'EMERGENCY':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 text-[10px] font-bold shadow-sm shadow-rose-500/20">Emergency</span>;
      case 'URGENT':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] font-bold shadow-sm shadow-amber-500/20">Urgent</span>;
      case 'ROUTINE':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold shadow-sm shadow-emerald-500/20">Routine</span>;
      case 'FAST_TRACK':
        return <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 text-[10px] font-semibold shadow-sm shadow-cyan-500/20">Fast Track</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      
      {/* Doctor Station Selector Bar */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider font-mono">Clinical Station</span>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-white text-lg">
                {selectedDoctor ? selectedDoctor.name : 'All OPD Chambers'}
              </h3>
              {selectedDoctor && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] text-slate-300 font-mono">
                  {selectedDoctor.chamberNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {selectedDoctor ? `${selectedDoctor.specialty} • ${selectedDoctor.department}` : 'Select a clinical station to filter assigned queue'}
            </p>
          </div>
        </div>

        {/* Doctor Selector Dropdown */}
        <div className="flex items-center space-x-3">
          <select
            value={selectedDoctor?.id || ''}
            onChange={(e) => {
              const doc = doctors.find(d => d.id === e.target.value);
              if (doc) onSelectDoctor(doc);
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-teal-500 cursor-pointer shadow-inner"
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.chamberNumber} - {d.department})
              </option>
            ))}
          </select>

          <button
            onClick={handleCallNext}
            disabled={waitingQueue.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition shadow-lg shadow-teal-500/25 disabled:opacity-40 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Call Next Patient</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Queues, Right AI Assistant & Active Consultation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Priority Waiting Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="glass-panel rounded-3xl p-5 space-y-4 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-teal-400" />
                <h4 className="font-bold text-sm text-white">Priority OPD Queue ({waitingQueue.length})</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Sorted by Clinical Urgency</span>
            </div>

            <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
              {waitingQueue.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No patients currently waiting in this department queue.
                </div>
              ) : (
                waitingQueue.map((pat) => {
                  const isSelected = pat.id === selectedPatientId;

                  return (
                    <div
                      key={pat.id}
                      onClick={() => setSelectedPatientId(pat.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-500/60 shadow-lg shadow-teal-500/10 scale-[1.01]'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black text-white">{pat.tokenNumber}</span>
                            <span className="text-xs font-bold text-slate-200">{pat.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[220px]">
                            {pat.triage.chiefComplaint}
                          </span>
                        </div>
                        {getUrgencyPill(pat.triage.urgency)}
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                        <span>NEWS2: <strong className="text-teal-400 font-bold">{pat.triage.news2Score}</strong></span>
                        <span>Priority: <strong className="text-white">{pat.triage.priorityScore}/100</strong></span>
                        <span>Est. Wait: <strong>{pat.triage.estimatedWaitMinutes}m</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Active Patient Clinical Assistant & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {activePatientForAssistant ? (
            <div className="glass-panel rounded-3xl p-6 space-y-6 border border-slate-800">
              
              {/* Active Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider font-mono">Active Consultation Deck</span>
                  <div className="flex items-center space-x-3 mt-0.5">
                    <h3 className="text-xl font-black text-white font-mono">{activePatientForAssistant.tokenNumber}</h3>
                    <span className="text-base font-bold text-slate-200">{activePatientForAssistant.name}</span>
                    <span className="text-xs text-slate-400">({activePatientForAssistant.age}y • {activePatientForAssistant.gender})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsAnnouncing(true);
                      announceTokenCall({
                        tokenNumber: activePatientForAssistant.tokenNumber,
                        chamberNumber: selectedDoctor?.chamberNumber || activePatientForAssistant.triage.recommendedChamber,
                        doctorName: selectedDoctor?.name,
                        patientName: activePatientForAssistant.name,
                        language: activePatientForAssistant.languagePreference || 'en',
                        onEnd: () => setIsAnnouncing(false)
                      });
                    }}
                    disabled={isAnnouncing}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-bold text-xs flex items-center space-x-1.5 transition"
                    title="Announce patient token over hospital public address"
                  >
                    {isAnnouncing ? (
                      <div className="flex items-center space-x-0.5 h-3 px-1">
                        <span className="w-1 bg-teal-400 rounded-full soundwave-bar" />
                        <span className="w-1 bg-teal-400 rounded-full soundwave-bar" />
                        <span className="w-1 bg-teal-400 rounded-full soundwave-bar" />
                      </div>
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                    )}
                    <span>{isAnnouncing ? 'Calling...' : 'Call on PA'}</span>
                  </button>

                  <button
                    onClick={() => setIsRxModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-teal-500/20"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Prescription</span>
                  </button>
                </div>
              </div>

              {/* AI Clinical Assistant Component */}
              <AIClinicalAssistant patient={activePatientForAssistant} />

              {/* Consultation Next Steps Action Grid */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Clinical Workflow Actions</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  <button
                    onClick={() => handleSendToDiagnostics(activePatientForAssistant.id)}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex flex-col items-center justify-center space-y-1 transition shadow-sm"
                  >
                    <TestTubes className="w-4 h-4" />
                    <span>Order Labs</span>
                  </button>

                  <button
                    onClick={() => handleSendToPharmacy(activePatientForAssistant.id)}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-xs font-bold flex flex-col items-center justify-center space-y-1 transition shadow-sm"
                  >
                    <Pill className="w-4 h-4" />
                    <span>Send to Pharmacy</span>
                  </button>

                  <button
                    onClick={() => handleAdmit(activePatientForAssistant.id)}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex flex-col items-center justify-center space-y-1 transition shadow-sm"
                  >
                    <Bed className="w-4 h-4" />
                    <span>Admit Inpatient</span>
                  </button>

                  <button
                    onClick={() => handleDischarge(activePatientForAssistant.id)}
                    className="p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex flex-col items-center justify-center space-y-1 transition shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Visit</span>
                  </button>

                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-800">
              Select a patient from the queue to open clinical review deck.
            </div>
          )}

        </div>

      </div>

      {/* Prescription Editor Modal */}
      {activePatientForAssistant && (
        <PrescriptionEditorModal
          isOpen={isRxModalOpen}
          onClose={() => setIsRxModalOpen(false)}
          patient={activePatientForAssistant}
        />
      )}

    </div>
  );
};
