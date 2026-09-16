import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Sparkles, 
  Bed, 
  CheckCircle2, 
  Play,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface SurgeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurgeSimulatorModal: React.FC<SurgeSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { triggerSimulation } = useHospital();
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ message: string; affectedCount: number } | null>(null);

  if (!isOpen) return null;

  const runScenario = async (scenarioId: string) => {
    setLoadingScenario(scenarioId);
    setLastResult(null);
    try {
      const res = await triggerSimulation(scenarioId);
      setLastResult(res);
    } catch (e: any) {
      alert(`Simulation error: ${e.message}`);
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-lg">Hospital Surge & Chaos Simulator</h3>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  STRESS TEST ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate real-world hospital crisis scenarios to evaluate AI autonomous triage and predictive bed turnover.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulator Scenarios List */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-5">
          
          {/* Result Alert Box */}
          {lastResult && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between gap-3 text-xs text-emerald-200 animate-in fade-in duration-150 shadow-lg shadow-emerald-500/10">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <strong className="font-bold text-white block">Simulation Activated:</strong>
                  <span className="text-emerald-200">{lastResult.message}</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-emerald-500/40 font-mono font-bold text-emerald-300 text-xs shadow-sm">
                +{lastResult.affectedCount} Affected
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Scenario 1: Mass Casualty */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-rose-500/50 transition flex flex-col justify-between space-y-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 text-[10px] font-bold uppercase tracking-wider block w-fit mb-2">
                  High Severity Trauma
                </span>
                <h4 className="text-base font-bold text-white mb-1">Mass Casualty Highway Accident</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Simulates a major highway pileup with 4 critical polytrauma victims. Injects hypoxia, shock vitals, and triggers automated Code Yellow ER protocols.
                </p>
              </div>

              <button
                disabled={loadingScenario !== null}
                onClick={() => runScenario('MASS_CASUALTY')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-rose-600/25 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loadingScenario === 'MASS_CASUALTY' ? 'Injecting Surge...' : 'Inject +4 Critical Casualties'}</span>
              </button>
            </div>

            {/* Scenario 2: Festival OPD Surge */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition flex flex-col justify-between space-y-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider block w-fit mb-2">
                  OPD Queue Overload
                </span>
                <h4 className="text-base font-bold text-white mb-1">Seasonal Festival OPD Influx</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Spikes Pediatrics and General Medicine influx by +8 concurrent patients with gastroenteritis & viral fevers, testing automated chamber balancing.
                </p>
              </div>

              <button
                disabled={loadingScenario !== null}
                onClick={() => runScenario('FESTIVAL_SURGE')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-amber-600/25 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loadingScenario === 'FESTIVAL_SURGE' ? 'Spiking OPD...' : 'Trigger +8 Seasonal Influx'}</span>
              </button>
            </div>

            {/* Scenario 3: Fast-Track Bed Turnover */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/50 transition flex flex-col justify-between space-y-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/40 text-[10px] font-bold uppercase tracking-wider block w-fit mb-2">
                  Turnover Acceleration
                </span>
                <h4 className="text-base font-bold text-white mb-1">Predictive Bed Discharge & Sanitation</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Calculates discharge readiness for admitted patients ({'>'}60%) and fast-tracks them to cleaning, unlocking immediate ward capacity.
                </p>
              </div>

              <button
                disabled={loadingScenario !== null}
                onClick={() => runScenario('RAPID_TURNOVER')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-teal-500/25 disabled:opacity-50"
              >
                <Bed className="w-3.5 h-3.5" />
                <span>{loadingScenario === 'RAPID_TURNOVER' ? 'Releasing Beds...' : 'Run Fast-Track Bed Release'}</span>
              </button>
            </div>

            {/* Scenario 4: Autonomous AI Balance */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition flex flex-col justify-between space-y-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase tracking-wider block w-fit mb-2">
                  System Equilibrium
                </span>
                <h4 className="text-base font-bold text-white mb-1">Autonomous AI Load Equilibrium</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Executes all active AI bottleneck recommendations simultaneously, mobilizing reserve specialists and dynamically rebalancing chambers.
                </p>
              </div>

              <button
                disabled={loadingScenario !== null}
                onClick={() => runScenario('AI_AUTO_BALANCE')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loadingScenario === 'AI_AUTO_BALANCE' ? 'Balancing System...' : 'Auto-Resolve All Bottlenecks'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
