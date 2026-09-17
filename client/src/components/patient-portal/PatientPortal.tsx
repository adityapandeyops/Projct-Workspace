import React, { useState } from 'react';
import { SelfCheckIn } from './SelfCheckIn';
import { TokenTracker } from './TokenTracker';
import { HospitalRouteMap } from './HospitalRouteMap';
import { PreventiveHealthCheck } from './PreventiveHealthCheck';
import { useHospital } from '../../context/HospitalContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserCheck, Compass, Ticket, Sparkles, HeartPulse, Clock, ShieldCheck } from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const { activePatient } = useHospital();
  const { t } = useLanguage();
  const [subTab, setSubTab] = useState<'REGISTER' | 'TRACK' | 'MAP' | 'HEALTH_CHECK'>('HEALTH_CHECK');

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      
      {/* Regional Wait Time Advantage Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-slate-900 to-indigo-500/10 border border-teal-500/30 text-xs shadow-md">
        <div className="flex items-center space-x-2.5">
          <span className="p-1 rounded-lg bg-teal-500/20 text-teal-300">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <span className="text-slate-300">
            Current Tech Voyager OPD Wait: <strong className="text-teal-300 font-mono">15 mins</strong>
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">
            Nearby Regional Hospitals: <span className="text-slate-400 line-through">45-75 mins</span>
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-teal-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AI Rapid Bed & Influx Turnover</span>
        </div>
      </div>

      {/* Sleek Sub-Navigation Pills */}
      <div className="flex justify-center">
        <div className="inline-flex items-center space-x-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl">
          
          <button
            onClick={() => setSubTab('HEALTH_CHECK')}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              subTab === 'HEALTH_CHECK'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>AI Health Screening</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-400/30 text-[9px] font-black uppercase text-teal-200">
              New
            </span>
          </button>

          <button
            onClick={() => setSubTab('REGISTER')}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              subTab === 'REGISTER'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md shadow-teal-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t('selfCheckIn')}</span>
          </button>

          <button
            onClick={() => setSubTab('TRACK')}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${
              subTab === 'TRACK'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>{t('liveTracker')}</span>
            {activePatient && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80" />
            )}
          </button>

          <button
            onClick={() => setSubTab('MAP')}
            disabled={!activePatient}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              subTab === 'MAP'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/25 scale-[1.02]'
                : !activePatient
                ? 'opacity-40 cursor-not-allowed text-slate-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t('wayfinding')}</span>
          </button>

        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {subTab === 'HEALTH_CHECK' && (
          <PreventiveHealthCheck onTokenGenerated={() => setSubTab('TRACK')} />
        )}

        {subTab === 'REGISTER' && (
          <SelfCheckIn onRegistrationSuccess={() => setSubTab('TRACK')} />
        )}

        {subTab === 'TRACK' && (
          <TokenTracker onNewRegistration={() => setSubTab('REGISTER')} />
        )}

        {subTab === 'MAP' && activePatient && (
          <HospitalRouteMap patient={activePatient} />
        )}
      </div>

    </div>
  );
};

