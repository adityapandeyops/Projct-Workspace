import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Bed, 
  Stethoscope,
  ShieldCheck,
  Zap,
  Cpu
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { AIResourceRecommendation } from '../../types';

export const AIResourceRecommendations: React.FC = () => {
  const { recommendations, executeRecommendation } = useHospital();

  const handleExecute = async (id: string) => {
    await executeRecommendation(id);
  };

  const getSeverityBadge = (severity: AIResourceRecommendation['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 text-[10px] font-bold shadow-sm shadow-rose-500/20 animate-pulse">Critical Impact</span>;
      case 'WARNING':
        return <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] font-bold shadow-sm shadow-amber-500/20">High Priority</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/40 text-[10px] font-bold shadow-sm shadow-teal-500/20">Standard Optimization</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-bold text-white">AI Autonomous Resource Allocator</h3>
            <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-mono font-bold">
              AUTONOMOUS EQUILIBRIUM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time proactive load balancing and predictive doctor / bed reassignment.</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold shadow-inner">
            {recommendations.filter(r => !r.isExecuted).length} Optimizations Ready
          </span>
        </div>
      </div>

      {/* Recommendations Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          return (
            <div 
              key={rec.id} 
              className={`glass-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between border transition-all duration-200 ${
                rec.isExecuted 
                  ? 'border-slate-800/60 bg-slate-950/40 opacity-70' 
                  : 'border-slate-800 hover:border-teal-500/40 shadow-xl'
              }`}
            >
              <div className="space-y-3">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-300">{rec.sourceDepartment}</span>
                  </div>
                  {getSeverityBadge(rec.severity)}
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {rec.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {rec.description}
                </p>

                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/25 text-xs text-slate-200 leading-relaxed shadow-inner">
                  <span className="font-bold text-teal-300 block mb-1">Suggested Autonomous Action:</span>
                  {rec.suggestedAction}
                </div>

              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(rec.timestamp).toLocaleTimeString()}
                </span>

                {rec.isExecuted ? (
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Applied to Roster</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleExecute(rec.id)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 transition shadow-md shadow-teal-500/25 transform hover:scale-[1.02]"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Execute Rebalance</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
