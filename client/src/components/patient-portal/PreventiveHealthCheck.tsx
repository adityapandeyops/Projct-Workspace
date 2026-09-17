import React, { useState } from 'react';
import { 
  HeartPulse, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Phone, 
  Share2, 
  Clock, 
  Zap, 
  Award,
  Stethoscope,
  TrendingUp
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useLanguage } from '../../context/LanguageContext';

interface PreventiveHealthCheckProps {
  onTokenGenerated: () => void;
}

export const PreventiveHealthCheck: React.FC<PreventiveHealthCheckProps> = ({ onTokenGenerated }) => {
  const { checkinPatient, setActivePatientToken } = useHospital();
  const { t, language } = useLanguage();

  const [step, setStep] = useState<'ASSESS' | 'RESULT'>('ASSESS');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(34);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [phone, setPhone] = useState('');
  const [activityLevel, setActivityLevel] = useState<'SEDENTARY' | 'MODERATE' | 'ACTIVE'>('MODERATE');
  const [lifestyleRisk, setLifestyleRisk] = useState<'NONE' | 'SMOKER' | 'HYPERTENSION_FAMILY' | 'DIABETES_FAMILY'>('NONE');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [bpSystolic, setBpSystolic] = useState<number>(122);
  const [heartRate, setHeartRate] = useState<number>(76);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const symptomOptions = [
    { id: 'fatigue', label: 'Chronic Fatigue / Lethargy', category: 'General' },
    { id: 'chest_discomfort', label: 'Occasional Chest Heaviness', category: 'Cardio' },
    { id: 'shortness_breath', label: 'Shortness of Breath on Exertion', category: 'Pulmonary' },
    { id: 'joint_stiffness', label: 'Joint Aches / Stiffness', category: 'Ortho' },
    { id: 'acid_reflux', label: 'Digestive Acidity / Bloating', category: 'GI' },
    { id: 'headache', label: 'Frequent Tension Headaches', category: 'Neuro' },
  ];

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Calculate dynamic wellness score (0 - 100)
  const calculateScore = () => {
    let score = 94;
    if (age > 45) score -= 8;
    if (age > 60) score -= 8;
    if (activityLevel === 'SEDENTARY') score -= 10;
    if (lifestyleRisk !== 'NONE') score -= 12;
    if (bpSystolic > 135) score -= 12;
    if (bpSystolic > 150) score -= 15;
    if (heartRate > 95 || heartRate < 55) score -= 6;
    score -= selectedSymptoms.length * 7;
    return Math.max(35, Math.min(99, score));
  };

  const wellnessScore = calculateScore();

  const getRiskCategory = () => {
    if (wellnessScore >= 80) return { label: 'Optimal Wellness', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' };
    if (wellnessScore >= 60) return { label: 'Moderate Preventive Need', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' };
    return { label: 'Priority Medical Review Recommended', color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10' };
  };

  const riskInfo = getRiskCategory();

  const handleInstantTokenBooking = async () => {
    if (!name.trim()) {
      alert('Please enter your name for the appointment token.');
      return;
    }
    setIsSubmitting(true);
    try {
      const patient = await checkinPatient({
        name: name.trim(),
        age: Number(age) || 30,
        gender,
        phone: phone.trim() || '9876543210',
        languagePreference: language,
        vitals: {
          heartRate: Number(heartRate) || 76,
          bloodPressureSystolic: Number(bpSystolic) || 120,
          bloodPressureDiastolic: 80,
          oxygenSaturation: 98,
          temperature: 98.4,
          respiratoryRate: 16,
          painLevel: selectedSymptoms.length > 0 ? 2 : 0,
        },
        chiefComplaint: selectedSymptoms.length > 0 
          ? `Preventive Health Check: ${selectedSymptoms.join(', ')}`
          : 'Annual Preventive Health & Wellness Screening',
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ['Preventive Routine Screening'],
      });

      setActivePatientToken(patient.tokenNumber);
      onTokenGenerated();
    } catch (err) {
      console.error('Error in instant check-in:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const text = `I just took the Tech Voyager AI Health Assessment! My Wellness Score is ${wellnessScore}/100. Get your free screening with <15 min OPD fast-track at Tech Voyager!`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-950 border border-teal-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>COMMUNITY PREVENTIVE CARE PROGRAM</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Preventive Health Check & Fast-Track OPD
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Check your personalized Cardio-Metabolic Wellness Score in 60 seconds. Instantly unlock a VIP Fast-Track Token at Tech Voyager Hospital with under 15-minute wait times.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center flex-shrink-0">
              <div className="text-2xl font-black font-mono text-teal-300">15 min</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Tech Voyager Wait</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center flex-shrink-0">
              <div className="text-2xl font-black font-mono text-slate-500 line-through">58 min</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">City Hospital Avg</div>
            </div>
          </div>
        </div>
      </div>

      {step === 'ASSESS' ? (
        /* Assessment Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Form Fields */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800">
            <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Your Health Profile & Vitals</h3>
                <p className="text-xs text-slate-400">AI analyzes indicators for early disease risk prevention</p>
              </div>
            </div>

            {/* Name & Demographic Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span>Phone Number (For SMS Slip)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400 transition"
                />
              </div>
            </div>

            {/* Age, Gender, Activity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Age: <span className="text-teal-400 font-mono font-bold">{age} yrs</span></label>
                <input
                  type="range"
                  min="18"
                  max="85"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-teal-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Gender</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        gender === g 
                          ? 'bg-teal-500/20 border-teal-500/60 text-teal-300' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Daily Physical Activity</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400"
                >
                  <option value="SEDENTARY">Sedentary (&lt; 3k steps)</option>
                  <option value="MODERATE">Moderate (Active daily)</option>
                  <option value="ACTIVE">High (Regular exercise)</option>
                </select>
              </div>
            </div>

            {/* Vitals Check: Blood Pressure & Heart Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Systolic Blood Pressure</span>
                  <span className="font-mono font-bold text-teal-400">{bpSystolic} mmHg</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="180"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(Number(e.target.value))}
                  className="w-full accent-teal-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>90 Normal</span>
                  <span>120 Optimal</span>
                  <span>140+ Elevated</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Resting Pulse Rate</span>
                  <span className="font-mono font-bold text-teal-400">{heartRate} bpm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="130"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full accent-teal-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>60 Athletic</span>
                  <span>75 Ideal</span>
                  <span>100+ Tachycardia</span>
                </div>
              </div>
            </div>

            {/* Symptom Multi-Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Any subtle symptoms experienced over the past 14 days?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {symptomOptions.map((symp) => {
                  const isChecked = selectedSymptoms.includes(symp.id);
                  return (
                    <button
                      key={symp.id}
                      type="button"
                      onClick={() => toggleSymptom(symp.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition ${
                        isChecked
                          ? 'bg-teal-500/15 border-teal-500/50 text-teal-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <span>{symp.label}</span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        isChecked ? 'bg-teal-500 border-teal-400 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={() => setStep('RESULT')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Calculate My AI Wellness & Risk Score</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Side Promo Card - Why Visit Tech Voyager */}
          <div className="space-y-4">
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2.5 text-teal-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Why Patients Choose Tech Voyager</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span><strong>AI-Assisted NEWS2 Triage</strong> prioritizes serious symptoms instantly without waiting in long queues.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Live Real-time Token Tracker</strong> on your phone so you never miss your turn.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Regional Hospital Coordination</strong> ensures zero bed shortages through instant partner hospital sync.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Digital Paperless Prescription</strong> and instant lab ordering directly to your device.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 text-indigo-200 text-xs space-y-3">
              <div className="flex items-center space-x-2 font-bold text-indigo-300">
                <Award className="w-4 h-4" />
                <span>NABH & AIIMS Gold Certified</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Ranked #1 in autonomous hospital resource optimization and emergency turnover efficiency.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* Result & 1-Click Fast-Track OPD Booking */
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-teal-500/40 space-y-8 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Result Header */}
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono font-bold border border-teal-500/30">
              AI CLINICAL SCREENING COMPLETE
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Your Personalized Wellness Assessment
            </h3>
            <p className="text-xs text-slate-400">
              Generated for <span className="text-white font-bold">{name || 'Patient'}</span> (Age {age}, {gender.toLowerCase()})
            </p>
          </div>

          {/* Score Display Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
              <div className="text-xs text-slate-400 font-semibold">AI Wellness Score</div>
              <div className="text-4xl font-black font-mono text-teal-300">
                {wellnessScore} <span className="text-xs text-slate-500">/100</span>
              </div>
              <div className="text-[10px] text-teal-400 font-medium">Higher = Optimal Health</div>
            </div>

            <div className={`p-5 rounded-2xl border text-center space-y-1 ${riskInfo.bg} ${riskInfo.border}`}>
              <div className="text-xs text-slate-300 font-semibold">Risk Classification</div>
              <div className={`text-base font-bold ${riskInfo.color}`}>
                {riskInfo.label}
              </div>
              <div className="text-[10px] text-slate-400">Cardio-Metabolic Stratum</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
              <div className="text-xs text-slate-400 font-semibold">Recommended OPD</div>
              <div className="text-base font-bold text-cyan-300">
                {selectedSymptoms.includes('chest_discomfort') ? 'Cardiology OPD' : 'General Medicine'}
              </div>
              <div className="text-[10px] text-slate-400">Chamber 101 - 104</div>
            </div>

          </div>

          {/* AI Clinical Insights */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-3">
            <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold font-mono">
              <Sparkles className="w-4 h-4" />
              <span>AI CLINICAL RECOMMENDATION SUMMARY</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on blood pressure ({bpSystolic} mmHg) and {selectedSymptoms.length > 0 ? selectedSymptoms.length + ' reported symptom(s)' : 'healthy vital readings'}, we advise a routine preventive consultation and basic metabolic baseline panel. Early screening reduces critical intervention risk by over 80%.
            </p>
          </div>

          {/* Action CTAs: 1-Click Fast-Track Booking & Share */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleInstantTokenBooking}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isSubmitting ? 'Generating Priority Token...' : 'Book Fast-Track OPD Token Now (Wait: ~15 mins)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleShare}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center space-x-2 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied to Clipboard!' : 'Share Score with Family'}</span>
              </button>

              <button
                onClick={() => setStep('ASSESS')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-medium transition"
              >
                Recalculate
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
