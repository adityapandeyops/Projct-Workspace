import React, { useState } from 'react';
import { SelfCheckIn } from './SelfCheckIn';
import { TokenTracker } from './TokenTracker';
import { HospitalRouteMap } from './HospitalRouteMap';
import { useHospital } from '../../context/HospitalContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserCheck, Compass, Ticket, Sparkles } from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const { activePatient } = useHospital();
  const { t } = useLanguage();
  const [subTab, setSubTab] = useState<'REGISTER' | 'TRACK' | 'MAP'>('REGISTER');

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      
      {/* Sleek Sub-Navigation Pills */}
      <div className="flex justify-center">
        <div className="inline-flex items-center space-x-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl">
          
          <button
            onClick={() => setSubTab('REGISTER')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
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
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${
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
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
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
