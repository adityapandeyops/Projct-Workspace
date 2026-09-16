import React from 'react';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  Navigation, 
  Building2,
  AlertCircle
} from 'lucide-react';
import { Patient } from '../../types';

interface HospitalRouteMapProps {
  patient: Patient;
}

export const HospitalRouteMap: React.FC<HospitalRouteMapProps> = ({ patient }) => {
  const waypoints = [
    {
      step: 1,
      title: 'Digital Kiosk / Registration Desk',
      location: 'Ground Floor, Main Atrium Entrance',
      status: 'COMPLETED',
      instruction: 'Token and initial demographic check-in verified.',
      estimatedTime: 'Done',
    },
    {
      step: 2,
      title: 'AI Clinical Triage Kiosk',
      location: 'Ground Floor, Station Bay 2',
      status: 'COMPLETED',
      instruction: 'Physiological vitals captured. NEWS2 score calculated.',
      estimatedTime: 'Done',
    },
    {
      step: 3,
      title: `${patient.triage.assignedDepartment} Consultation`,
      location: patient.triage.recommendedChamber,
      status: patient.stage === 'IN_CONSULTATION' ? 'ACTIVE' : patient.stage === 'WAITING_OPD' ? 'ACTIVE' : 'COMPLETED',
      instruction: `Report to ${patient.triage.recommendedChamber}. Token #${patient.tokenNumber} will be called by audio chime.`,
      estimatedTime: `Wait: ${patient.triage.estimatedWaitMinutes} mins`,
    },
    {
      step: 4,
      title: 'Diagnostics / Laboratory (If Ordered)',
      location: '1st Floor, Diagnostic Wing B (Elevator 2)',
      status: patient.stage === 'DIAGNOSTICS' ? 'ACTIVE' : 'PENDING',
      instruction: 'Sample collection and medical imaging scans.',
      estimatedTime: '~15-20 mins',
    },
    {
      step: 5,
      title: 'Central Pharmacy & Discharge',
      location: 'Ground Floor, West Counter 4',
      status: patient.stage === 'PHARMACY' ? 'ACTIVE' : 'PENDING',
      instruction: 'Collect prescribed medications with digital barcode slip.',
      estimatedTime: '~5-10 mins',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Wayfinding Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg font-display">Indoor Hospital Wayfinding</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Turn-by-turn navigation for Token <span className="font-mono font-bold text-teal-300">#{patient.tokenNumber}</span> ({patient.name})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold shadow-inner">
            Destination: {patient.triage.assignedDepartment}
          </span>
        </div>
      </div>

      {/* Timeline Steps Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8 border border-slate-800">
        <div className="space-y-6">
          {waypoints.map((wp, index) => {
            const isCompleted = wp.status === 'COMPLETED';
            const isActive = wp.status === 'ACTIVE';

            return (
              <div key={wp.step} className="relative flex items-start space-x-4">
                
                {/* Vertical Connecting Line */}
                {index < waypoints.length - 1 && (
                  <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${
                    isCompleted ? 'bg-teal-500' : 'bg-slate-800'
                  }`} />
                )}

                {/* Step Icon Badge */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 font-bold text-xs ${
                  isCompleted 
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-md shadow-teal-500/20' 
                    : isActive 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-teal-500/30 ring-4 ring-teal-500/20' 
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : wp.step}
                </div>

                {/* Step Content Card */}
                <div className={`flex-1 p-5 rounded-2xl border transition-all ${
                  isActive 
                    ? 'bg-slate-900/90 border-teal-500/50 shadow-md shadow-teal-500/10' 
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h4 className="font-bold text-sm text-white">{wp.title}</h4>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-teal-400" />
                      <span>{wp.estimatedTime}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-teal-300 font-medium mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span>{wp.location}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {wp.instruction}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
