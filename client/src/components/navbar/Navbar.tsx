import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  Zap, 
  Volume2, 
  VolumeX, 
  Clock, 
  Radio,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useLanguage, Language } from '../../context/LanguageContext';

export type AppTab = 'PATIENT' | 'COMMAND_CENTER' | 'DOCTOR' | 'ADMIN';

interface NavbarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  onOpenSurgeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenSurgeModal }) => {
  const { isConnected, criticalAlertCount, soundEnabled, setSoundEnabled } = useHospital();
  const { language, setLanguage, t } = useLanguage();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const languageLabels: Record<Language, { label: string; flag: string }> = {
    en: { label: 'English', flag: '🇬🇧' },
    hi: { label: 'हिन्दी', flag: '🇮🇳' },
    ta: { label: 'தமிழ்', flag: '🇮🇳' },
    bn: { label: 'বাংলা', flag: '🇮🇳' },
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl shadow-2xl shadow-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo with Glowing Aura */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer group" 
            onClick={() => setCurrentTab('PATIENT')}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-11 h-11 rounded-xl bg-slate-900 border border-teal-500/40 flex items-center justify-center text-teal-300 font-black shadow-inner">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-teal-300 via-cyan-200 to-white bg-clip-text text-transparent font-display">
                  Tech Voyager
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-mono font-bold tracking-wider">
                  AI PROTOTYPE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">AI Hospital Flow & Resource Optimization</p>
            </div>
          </div>

          {/* Center Floating Pill Navigation */}
          <nav className="hidden md:flex items-center space-x-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-inner">
            
            <button
              id="nav-patient"
              onClick={() => setCurrentTab('PATIENT')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                currentTab === 'PATIENT' 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-lg shadow-teal-500/25 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('patientPortal')}</span>
            </button>

            <button
              id="nav-command"
              onClick={() => setCurrentTab('COMMAND_CENTER')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                currentTab === 'COMMAND_CENTER' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-teal-500/25 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{t('commandCenter')}</span>
              {criticalAlertCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse shadow-sm shadow-rose-500/50">
                  {criticalAlertCount}
                </span>
              )}
            </button>

            <button
              id="nav-doctor"
              onClick={() => setCurrentTab('DOCTOR')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                currentTab === 'DOCTOR' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-teal-500/25 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t('doctorPortal')}</span>
            </button>

            <button
              id="nav-admin"
              onClick={() => setCurrentTab('ADMIN')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                currentTab === 'ADMIN' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-teal-500/25 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>

          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2.5">
            
            {/* Surge Simulator Action Button */}
            <button
              onClick={onOpenSurgeModal}
              className="group relative flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 text-amber-300 hover:border-amber-400 hover:from-amber-500/25 hover:to-rose-500/25 text-xs font-bold transition shadow-md shadow-amber-500/10"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition animate-bounce-subtle" />
              <span className="hidden sm:inline">Surge Simulator</span>
            </button>

            {/* Language Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition"
              >
                <span>{languageLabels[language]?.flag || '🌐'}</span>
                <span className="hidden sm:inline">{languageLabels[language]?.label || 'Language'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 backdrop-blur-2xl animate-in fade-in">
                  {(Object.keys(languageLabels) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center space-x-2.5 hover:bg-slate-800/80 transition ${
                        language === lang ? 'text-teal-400 font-bold bg-teal-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span>{languageLabels[lang].flag}</span>
                      <span>{languageLabels[lang].label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs transition ${
                soundEnabled 
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Acoustic alerts enabled' : 'Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Live WebSocket Status & Clock */}
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span>{currentTime}</span>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2.5 border-t border-slate-800/80 bg-slate-950/90">
        <button
          onClick={() => setCurrentTab('PATIENT')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold rounded-xl transition ${
            currentTab === 'PATIENT' ? 'text-teal-300 bg-teal-500/15' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Patient</span>
        </button>

        <button
          onClick={() => setCurrentTab('COMMAND_CENTER')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold rounded-xl transition ${
            currentTab === 'COMMAND_CENTER' ? 'text-teal-300 bg-teal-500/15' : 'text-slate-400'
          }`}
        >
          <Activity className="w-4 h-4 mb-0.5" />
          <span>Command</span>
        </button>

        <button
          onClick={() => setCurrentTab('DOCTOR')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold rounded-xl transition ${
            currentTab === 'DOCTOR' ? 'text-teal-300 bg-teal-500/15' : 'text-slate-400'
          }`}
        >
          <Stethoscope className="w-4 h-4 mb-0.5" />
          <span>Doctor</span>
        </button>

        <button
          onClick={() => setCurrentTab('ADMIN')}
          className={`flex flex-col items-center py-1 px-3 text-[10px] font-bold rounded-xl transition ${
            currentTab === 'ADMIN' ? 'text-teal-300 bg-teal-500/15' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};
