import React from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  CheckCircle2,
  Activity,
  HeartPulse,
  Wind,
  Thermometer,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { Patient } from '../../types';
import { useHospital } from '../../context/HospitalContext';

interface AIClinicalAssistantProps {
  patient: Patient;
  onOrderDiagnostic?: (testName: string, dept: 'RADIOLOGY' | 'PATHOLOGY') => void;
}

export const AIClinicalAssistant: React.FC<AIClinicalAssistantProps> = ({ patient }) => {
  const { addLabOrder } = useHospital();

  const handleQuickOrder = async (testName: string) => {
    const isRadiology = testName.toLowerCase().includes('x-ray') || 
                        testName.toLowerCase().includes('scan') || 
                        testName.toLowerCase().includes('ultrasound') || 
                        testName.toLowerCase().includes('ct') || 
                        testName.toLowerCase().includes('mri') || 
                        testName.toLowerCase().includes('echo');

    await addLabOrder(patient.id, {
      testName,
      department: isRadiology ? 'RADIOLOGY' : 'PATHOLOGY',
    });
    alert(`Order for ${testName} queued in Lab Station.`);
  };

  const getAdmissionRiskBadge = (risk: number) => {
    if (risk >= 75) {
      return <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 text-xs font-mono font-bold shadow-sm shadow-rose-500/20 animate-pulse">High Admission Risk ({risk}%)</span>;
    }
    if (risk >= 40) {
      return <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold shadow-sm shadow-amber-500/20">Moderate Risk ({risk}%)</span>;
    }
    return <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold shadow-sm shadow-emerald-500/20">Routine OPD ({risk}%)</span>;
  };

  return (
    <div className="glass-card rounded-3xl p-6 space-y-6 border border-slate-800">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">AI Clinical Copilot & Diagnosis Assistant</h4>
            <p className="text-[11px] text-slate-400">NEWS2 Physiological Triage & Risk Assessment</p>
          </div>
        </div>

        {getAdmissionRiskBadge(patient.triage.admissionRiskPercent)}
      </div>

      {/* Vitals Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">NEWS2 Score</span>
          <div className={`text-xl font-black font-mono mt-0.5 ${
            patient.triage.news2Score >= 7 ? 'text-rose-400' :
            patient.triage.news2Score >= 4 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {patient.triage.news2Score} / 14
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Blood Pressure</span>
          <div className="text-sm font-bold text-white font-mono mt-0.5">
            {patient.vitals.bloodPressureSystolic}/{patient.vitals.bloodPressureDiastolic} <span className="text-[10px] text-slate-500">mmHg</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Heart Rate</span>
          <div className="text-sm font-bold text-white font-mono mt-0.5 flex items-center space-x-1">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>{patient.vitals.heartRate} bpm</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">SpO2 Saturation</span>
          <div className={`text-sm font-bold font-mono mt-0.5 ${patient.vitals.oxygenSaturation <= 92 ? 'text-rose-400 font-black' : 'text-white'}`}>
            {patient.vitals.oxygenSaturation}%
          </div>
        </div>

      </div>

      {/* Red Flag Clinical Warnings */}
      {patient.triage.redFlagWarnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-200 space-y-1.5 shadow-inner">
          <div className="flex items-center space-x-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Critical Hemodynamic Red Flags:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-rose-200">
            {patient.triage.redFlagWarnings.map((rf, i) => (
              <li key={i} className="font-medium">{rf}</li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Clinical Summary Narrative */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 text-xs text-slate-200 space-y-1 shadow-inner">
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">Physiological Evaluation:</span>
        <p className="leading-relaxed font-medium">
          {patient.triage.aiClinicalSummary}
        </p>
      </div>

      {/* Recommended Diagnostics Quick Order */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-300 block">AI Recommended Diagnostic Tests:</span>
        <div className="flex flex-wrap gap-2">
          {patient.triage.recommendedDiagnostics.map((test) => (
            <button
              key={test}
              onClick={() => handleQuickOrder(test)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{test}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
