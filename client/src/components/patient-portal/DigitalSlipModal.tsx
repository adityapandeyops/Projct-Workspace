import React from 'react';
import { X, Printer, QrCode, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Patient } from '../../types';

interface DigitalSlipModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalSlipModal: React.FC<DigitalSlipModalProps> = ({ patient, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">Digital Hospital OPD Pass</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 space-y-5 text-center" id="printable-slip">
          
          <div className="space-y-1">
            <h3 className="text-xl font-black text-white font-display">Tech Voyager Apex Hospital</h3>
            <p className="text-xs text-teal-400 font-mono">Autonomous Outpatient Healthcare Network</p>
          </div>

          {/* Token Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-1 shadow-inner">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">OPD Token Number</span>
            <div className="text-4xl font-black text-white font-mono tracking-wider bg-gradient-to-r from-teal-300 via-cyan-200 to-white bg-clip-text text-transparent">
              {patient.tokenNumber}
            </div>
            <span className="text-xs font-bold text-teal-400 block font-mono">Queue Position: #{patient.queuePosition}</span>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-3 text-left text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px]">Patient Name</span>
              <strong className="text-white font-bold">{patient.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Age / Gender</span>
              <strong className="text-white font-bold">{patient.age} Y / {patient.gender}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Department</span>
              <strong className="text-teal-300 font-bold">{patient.triage.assignedDepartment}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Estimated Wait</span>
              <strong className="text-amber-400 font-mono font-bold">~{patient.triage.estimatedWaitMinutes} mins</strong>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
              <QrCode className="w-20 h-20 text-slate-950" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Scan at Doctor Station / Pharmacy Desk</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-teal-500/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip</span>
          </button>
        </div>

      </div>
    </div>
  );
};
