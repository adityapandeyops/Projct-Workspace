import React from 'react';
import { 
  Users, 
  Clock, 
  Stethoscope, 
  AlertTriangle, 
  ArrowRight, 
  Activity,
  CheckCircle2,
  Flame,
  Zap
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { DepartmentMetrics } from '../../types';

export const CongestionHeatmap: React.FC = () => {
  const { departments, doctors } = useHospital();

  const getStatusColor = (level: DepartmentMetrics['congestionLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return {
          pill: 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/20',
          bar: 'bg-gradient-to-r from-rose-500 to-red-600',
          dot: 'bg-rose-500 animate-ping',
          border: 'hover:border-rose-500/50',
        };
      case 'HIGH':
        return {
          pill: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20',
          bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
          dot: 'bg-amber-400',
          border: 'hover:border-amber-500/50',
        };
      case 'MODERATE':
        return {
          pill: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20',
          bar: 'bg-gradient-to-r from-cyan-500 to-blue-500',
          dot: 'bg-cyan-400',
          border: 'hover:border-cyan-500/50',
        };
      default:
        return {
          pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20',
          bar: 'bg-gradient-to-r from-teal-500 to-emerald-500',
          dot: 'bg-emerald-400',
          border: 'hover:border-teal-500/50',
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-bold text-white">Hospital Department Congestion Matrix</h3>
            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-mono font-bold">
              8 ACTIVE WINGS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time patient queue density vs maximum concurrent capacity.</p>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Optimal</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>High Load</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Critical Bottleneck</span>
          </span>
        </div>
      </div>

      {/* Departments Flow Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => {
          const styles = getStatusColor(dept.congestionLevel);
          const activeDocs = doctors.filter(d => d.department === dept.department && d.status === 'AVAILABLE').length;
          const occupancy = Math.min(100, dept.congestionPercent || Math.round((dept.currentQueueLength / (dept.capacity || 15)) * 100));

          return (
            <div 
              key={dept.department} 
              className={`glass-card rounded-3xl p-5 space-y-4 border border-slate-800 transition-all duration-200 ${styles.border}`}
            >
              
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm tracking-tight">{dept.displayName}</h4>
                  <span className="text-[11px] text-teal-400/90 font-medium">{activeDocs} Doctors Available</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles.pill}`}>
                  {dept.congestionLevel}
                </span>
              </div>

              {/* Queue Numbers */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-3xl font-black font-mono text-white tracking-tight">
                    {dept.currentQueueLength}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Waiting Patients</span>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end space-x-1 text-sm font-bold font-mono text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{dept.avgWaitTimeMinutes}m</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Est. Wait</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Capacity Load</span>
                  <span className="font-bold text-white">{occupancy}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                    style={{ width: `${Math.max(5, occupancy)}%` }}
                  />
                </div>
              </div>

              {/* Status Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate">{dept.statusDescription}</span>
                <span className="font-mono text-slate-500">Cap: {dept.capacity || 15}</span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
