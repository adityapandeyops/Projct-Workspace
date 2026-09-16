import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  HeartPulse, 
  Thermometer, 
  Wind, 
  Flame, 
  Phone,
  HelpCircle,
  Stethoscope,
  Info,
  Zap,
  Gauge
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useLanguage } from '../../context/LanguageContext';
import { DepartmentType, Vitals } from '../../types';

interface SelfCheckInProps {
  onRegistrationSuccess: () => void;
}

export const SelfCheckIn: React.FC<SelfCheckInProps> = ({ onRegistrationSuccess }) => {
  const { checkinPatient } = useHospital();
  const { t } = useLanguage();

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'hi' | 'ta' | 'bn'>('en');

  // Symptoms Selection
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customComplaint, setCustomComplaint] = useState('');

  // Vitals State
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [heartRate, setHeartRate] = useState<number>(76);
  const [spo2, setSpo2] = useState<number>(98);
  const [temp, setTemp] = useState<number>(98.6);
  const [respRate, setRespRate] = useState<number>(16);

  const [loading, setLoading] = useState(false);

  // Common quick-pick symptom tags
  const symptomCategories = [
    { label: 'Chest Pain / Pressure', dept: 'CARDIOLOGY', urgency: 'URGENT', icon: '🫀' },
    { label: 'Severe Breathlessness / Asthma', dept: 'PEDIATRICS', urgency: 'URGENT', icon: '🫁' },
    { label: 'High Fever & Chills (>102°F)', dept: 'GENERAL_MEDICINE', urgency: 'ROUTINE', icon: '🌡️' },
    { label: 'Severe Headache & Dizziness', dept: 'GENERAL_MEDICINE', urgency: 'ROUTINE', icon: '🧠' },
    { label: 'Bone Fracture / Sprain / Joint Pain', dept: 'ORTHOPEDICS', urgency: 'ROUTINE', icon: '🦴' },
    { label: 'Abdominal Pain / Vomiting', dept: 'GENERAL_MEDICINE', urgency: 'ROUTINE', icon: '🤢' },
    { label: 'Child Cough / Fever / Wheezing', dept: 'PEDIATRICS', urgency: 'ROUTINE', icon: '👶' },
    { label: 'Trauma / Heavy Bleeding / Cut', dept: 'EMERGENCY', urgency: 'EMERGENCY', icon: '🩸' },
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Demo presets for easy evaluation
  const applyPreset = (type: 'ROUTINE' | 'CARDIO' | 'CRITICAL') => {
    if (type === 'ROUTINE') {
      setName('Rahul Sharma');
      setAge(29);
      setGender('MALE');
      setPhoneNumber('9876543210');
      setSelectedSymptoms(['High Fever & Chills (>102°F)']);
      setSystolic(118);
      setDiastolic(78);
      setHeartRate(78);
      setSpo2(99);
      setTemp(101.4);
      setRespRate(18);
    } else if (type === 'CARDIO') {
      setName('Meenakshi Sundaram');
      setAge(58);
      setGender('FEMALE');
      setPhoneNumber('9840123456');
      setSelectedSymptoms(['Chest Pain / Pressure', 'Severe Breathlessness / Asthma']);
      setSystolic(165);
      setDiastolic(100);
      setHeartRate(112);
      setSpo2(93);
      setTemp(98.6);
      setRespRate(24);
    } else if (type === 'CRITICAL') {
      setName('Vikramaditya Rao');
      setAge(47);
      setGender('MALE');
      setPhoneNumber('9988776655');
      setSelectedSymptoms(['Trauma / Heavy Bleeding / Cut', 'Chest Pain / Pressure']);
      setSystolic(85);
      setDiastolic(55);
      setHeartRate(138);
      setSpo2(87);
      setTemp(97.2);
      setRespRate(32);
    }
  };

  // NEWS2 calculation preview
  const calculateNews2Preview = (): { score: number; urgency: string; color: string } => {
    let score = 0;
    if (respRate <= 8 || respRate >= 25) score += 3;
    else if (respRate >= 21) score += 2;
    else if (respRate <= 11) score += 1;

    if (spo2 <= 91) score += 3;
    else if (spo2 <= 93) score += 2;
    else if (spo2 <= 95) score += 1;

    if (systolic <= 90 || systolic >= 220) score += 3;
    else if (systolic <= 100) score += 2;
    else if (systolic <= 110) score += 1;

    if (heartRate <= 40 || heartRate >= 131) score += 3;
    else if (heartRate >= 111) score += 2;
    else if (heartRate <= 50 || heartRate >= 91) score += 1;

    if (temp <= 95.0 || temp >= 102.4) score += 2;
    else if (temp <= 96.8 || temp >= 100.4) score += 1;

    if (score >= 7) return { score, urgency: 'EMERGENCY', color: 'text-rose-400 bg-rose-500/15 border-rose-500/40' };
    if (score >= 4) return { score, urgency: 'URGENT', color: 'text-amber-400 bg-amber-500/15 border-amber-500/40' };
    return { score, urgency: 'ROUTINE', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40' };
  };

  const news2Preview = calculateNews2Preview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const fullComplaint = [
      ...selectedSymptoms,
      customComplaint.trim()
    ].filter(Boolean).join(', ') || 'General OPD Health Checkup';

    const vitalsData: Vitals = {
      bloodPressureSystolic: Number(systolic),
      bloodPressureDiastolic: Number(diastolic),
      heartRate: Number(heartRate),
      oxygenSaturation: Number(spo2),
      temperature: Number(temp),
      respiratoryRate: Number(respRate),
      painLevel: 0,
    };

    setLoading(true);
    try {
      await checkinPatient({
        name: name.trim(),
        age: Number(age),
        gender,
        phone: phoneNumber.trim() || '9999999999',
        languagePreference: preferredLanguage,
        chiefComplaint: fullComplaint,
        symptoms: selectedSymptoms,
        vitals: vitalsData,
      });

      onRegistrationSuccess();
    } catch (err: any) {
      alert(`Registration error: ${err.message || 'Please check your inputs'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Demo Preset Helper Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Quick Patient Demo Presets</span>
            <span className="text-[11px] text-slate-400">One-click telemetry prefill for evaluation</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => applyPreset('ROUTINE')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            Routine OPD
          </button>
          <button
            type="button"
            onClick={() => applyPreset('CARDIO')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
          >
            Cardio Influx
          </button>
          <button
            type="button"
            onClick={() => applyPreset('CRITICAL')}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-xs font-semibold transition"
          >
            Critical Trauma
          </button>
        </div>
      </div>

      {/* Main Registration Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8 border border-slate-800">
        
        {/* Section 1: Patient Identity */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">1. Patient Demographic Details</h3>
              <p className="text-xs text-slate-400">Enter patient personal identity and SMS contact notification preference.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Patient Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age (Years) *</label>
              <input
                type="number"
                min={1}
                max={120}
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition font-medium cursor-pointer"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number (SMS Token Alerts)</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Notification Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition font-medium cursor-pointer"
              >
                <option value="en">English (Official)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Section 2: Clinical Chief Complaints */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">2. Symptoms & Chief Complaints</h3>
              <p className="text-xs text-slate-400">Select pre-categorized symptoms for automatic department triage.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {symptomCategories.map((sym) => {
              const isSelected = selectedSymptoms.includes(sym.label);
              return (
                <button
                  type="button"
                  key={sym.label}
                  onClick={() => handleSymptomToggle(sym.label)}
                  className={`p-3 rounded-2xl border text-left flex items-start space-x-2.5 transition-all duration-200 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border-teal-500/60 shadow-md shadow-teal-500/10 text-white scale-[1.02]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{sym.icon}</span>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold block truncate">{sym.label}</span>
                    <span className="text-[10px] text-teal-400/80 font-mono block mt-0.5">{sym.dept}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Additional Clinical Notes or Other Symptoms</label>
            <input
              type="text"
              placeholder="e.g. Mild vomiting since morning, dizziness on standing..."
              value={customComplaint}
              onChange={(e) => setCustomComplaint(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition font-medium"
            />
          </div>
        </div>

        {/* Section 3: Telemetry Vitals & Real-Time NEWS2 Score Preview */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">3. Patient Vitals (Kiosk Telemetry)</h3>
                <p className="text-xs text-slate-400">Captured via Bluetooth sensor or triage nurse input.</p>
              </div>
            </div>

            {/* Live NEWS2 Early Warning Preview Chip */}
            <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${news2Preview.color}`}>
              <Gauge className="w-4 h-4" />
              <span>NEWS2 Score: {news2Preview.score} ({news2Preview.urgency})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Blood Pressure</span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(Number(e.target.value))}
                  className="w-12 bg-slate-950 border border-slate-700 rounded-lg px-1.5 py-1 text-xs text-white text-center font-bold focus:border-teal-500"
                />
                <span className="text-slate-500 text-xs">/</span>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(Number(e.target.value))}
                  className="w-12 bg-slate-950 border border-slate-700 rounded-lg px-1.5 py-1 text-xs text-white text-center font-bold focus:border-teal-500"
                />
              </div>
              <span className="text-[9px] text-slate-500 block">mmHg</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Heart Rate</span>
              <div className="flex items-center space-x-1.5">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-bold focus:border-teal-500"
                />
              </div>
              <span className="text-[9px] text-slate-500 block">bpm</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Oxygen SpO2</span>
              <div className="flex items-center space-x-1.5">
                <Wind className="w-4 h-4 text-cyan-400" />
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-bold focus:border-teal-500"
                />
              </div>
              <span className="text-[9px] text-slate-500 block">%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Temperature</span>
              <div className="flex items-center space-x-1.5">
                <Thermometer className="w-4 h-4 text-amber-400" />
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-bold focus:border-teal-500"
                />
              </div>
              <span className="text-[9px] text-slate-500 block">°F</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Resp Rate</span>
              <div className="flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-teal-400" />
                <input
                  type="number"
                  value={respRate}
                  onChange={(e) => setRespRate(Number(e.target.value))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-bold focus:border-teal-500"
                />
              </div>
              <span className="text-[9px] text-slate-500 block">breaths/min</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Pain Scale</span>
              <span className="text-xs font-bold text-teal-400 block pt-1">Auto-Estimated</span>
              <span className="text-[9px] text-slate-500 block">AI Heuristic</span>
            </div>

          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>AI will auto-generate your live digital queue token and clinical route.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-xl shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? (
              <span>Processing Triage...</span>
            ) : (
              <>
                <span>Generate OPD Token & Route</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
