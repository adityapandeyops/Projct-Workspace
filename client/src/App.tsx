import React, { useState } from 'react';
import { HospitalProvider } from './context/HospitalContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar, AppTab } from './components/navbar/Navbar';
import { PatientPortal } from './components/patient-portal/PatientPortal';
import { CommandCenterDashboard } from './components/command-center/CommandCenterDashboard';
import { DoctorPortal } from './components/doctor-portal/DoctorPortal';
import { AdminManagementPanel } from './components/command-center/AdminManagementPanel';
import { CityHospitalNetwork } from './components/city-network/CityHospitalNetwork';
import { HospitalPulseTicker } from './components/navbar/HospitalPulseTicker';
import { LiveShowcaseHUD } from './components/showcase/LiveShowcaseHUD';
import { SurgeSimulatorModal } from './components/surge-simulator/SurgeSimulatorModal';
import { Activity, Sparkles, Shield, Cpu } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab>('PATIENT');
  const [isSurgeModalOpen, setIsSurgeModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-teal-500 selection:text-slate-950">
      
      {/* Ambient Radial Mesh Background Orbs */}
      <div className="ambient-mesh" />

      {/* Top Floating Glass Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSurgeModal={() => setIsSurgeModalOpen(true)}
      />

      {/* Real-time Rolling Hospital Pulse Ticker */}
      <HospitalPulseTicker onNavigateTab={(tab) => setCurrentTab(tab)} />

      {/* Main View Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full relative z-10">
        {currentTab === 'PATIENT' && <PatientPortal />}
        {currentTab === 'COMMAND_CENTER' && <CommandCenterDashboard />}
        {currentTab === 'CITY_NETWORK' && <CityHospitalNetwork />}
        {currentTab === 'DOCTOR' && <DoctorPortal />}
        {currentTab === 'ADMIN' && <AdminManagementPanel />}
      </main>

      {/* Floating Interactive Live Showcase HUD Tour */}
      <LiveShowcaseHUD
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenSurgeModal={() => setIsSurgeModalOpen(true)}
      />

      {/* Surge Simulator Trigger Modal */}
      <SurgeSimulatorModal
        isOpen={isSurgeModalOpen}
        onClose={() => setIsSurgeModalOpen(false)}
      />

      {/* Futuristic Medical Glass Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl py-6 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/20 font-black">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">Tech Voyager</span>
              <span className="text-teal-400 ml-2 text-[11px] font-mono font-semibold">HEALTHCARE AI INNOVATION</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Real-Time NEWS2 AI Triage</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center space-x-1.5 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Autonomous Influx Balancing</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center space-x-1.5 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dynamic Bed Turnover</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <HospitalProvider>
        <AppContent />
      </HospitalProvider>
    </LanguageProvider>
  );
}

export default App;
