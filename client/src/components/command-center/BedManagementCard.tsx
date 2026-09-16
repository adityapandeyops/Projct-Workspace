import React, { useState } from 'react';
import { 
  Bed as BedIcon, 
  CheckCircle2, 
  Clock, 
  Wind, 
  Activity, 
  ArrowRight, 
  Plus, 
  Sparkles,
  LogOut,
  Sliders,
  Filter,
  Zap
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Bed, BedStatus, BedType } from '../../types';

export const BedManagementCard: React.FC = () => {
  const { beds, stats, updateBedStatus, triggerSimulation } = useHospital();
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const wards = Array.from(new Set(beds.map(b => b.ward)));

  const filteredBeds = beds.filter(b => {
    if (selectedWard !== 'ALL' && b.ward !== selectedWard) return false;
    if (selectedType !== 'ALL' && b.type !== selectedType) return false;
    return true;
  });

  const getStatusBadge = (status: BedStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold shadow-sm shadow-emerald-500/20">Available</span>;
      case 'OCCUPIED':
        return <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/40 text-[10px] font-bold shadow-sm shadow-rose-500/20">Occupied</span>;
      case 'CLEANING':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] font-bold shadow-sm shadow-amber-500/20">Sanitizing</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold shadow-sm shadow-cyan-500/20">Reserved</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-bold text-white">Hospital Ward & Inpatient Bed Matrix</h3>
            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-mono font-bold">
              {beds.length} TOTAL BEDS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time bed availability, telemetry support, and predictive discharge turnover.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerSimulation('RAPID_TURNOVER')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-teal-500/20 transform hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast-Track Turnover</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg">
        <span className="text-xs font-bold text-slate-400 px-2 flex items-center space-x-1">
          <Filter className="w-3.5 h-3.5 text-teal-400" />
          <span>Wards:</span>
        </span>

        <button
          onClick={() => setSelectedWard('ALL')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
            selectedWard === 'ALL' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Wards ({beds.length})
        </button>

        {wards.map(w => (
          <button
            key={w}
            onClick={() => setSelectedWard(w)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              selectedWard === w ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {w}
          </button>
        ))}
      </div>

      {/* Bed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          return (
            <div 
              key={bed.id} 
              className="glass-card rounded-3xl p-5 space-y-3 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-base font-black text-white">{bed.bedNumber}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">({bed.type})</span>
                  </div>
                  {getStatusBadge(bed.status)}
                </div>
                <span className="text-[11px] text-slate-400 block truncate mt-0.5">{bed.ward}</span>
              </div>

              {/* Patient / Equipment telemetry */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                {bed.status === 'OCCUPIED' ? (
                  <div className="space-y-1">
                    <span className="text-white font-semibold block truncate">Pt: {bed.patientName || 'Admitted Patient'}</span>
                    {bed.dischargeReadinessScore && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Discharge Readiness:</span>
                        <span className={`font-mono font-bold ${bed.dischargeReadinessScore >= 80 ? 'text-teal-400' : 'text-amber-400'}`}>
                          {bed.dischargeReadinessScore}%
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500 italic">No patient assigned</span>
                )}

                <div className="flex items-center space-x-2 text-[10px] pt-1">
                  {bed.oxygenSupported && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center space-x-1">
                      <Wind className="w-3 h-3" />
                      <span>O2</span>
                    </span>
                  )}
                  {bed.ventilatorAttached && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>Vent</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                {bed.status === 'OCCUPIED' ? (
                  <button
                    onClick={() => updateBedStatus(bed.id, 'CLEANING')}
                    className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center space-x-1 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Discharge / Clean</span>
                  </button>
                ) : bed.status === 'CLEANING' ? (
                  <button
                    onClick={() => updateBedStatus(bed.id, 'AVAILABLE')}
                    className="w-full py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center space-x-1 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Available</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Ready for Admission</span>
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
