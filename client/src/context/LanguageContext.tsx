import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    appTitle: 'Tech Voyager | AI Hospital Flow',
    patientPortal: 'Patient Portal',
    commandCenter: 'Command Center',
    doctorPortal: 'Doctor Clinic',
    surgeSimulator: 'Surge Simulator',
    selfCheckIn: 'Self Check-In & OPD Token',
    liveTracker: 'Live Token Tracker',
    hospitalRoute: 'Hospital Route Map',
    fullName: 'Full Patient Name',
    age: 'Age (Years)',
    gender: 'Gender',
    phone: 'Mobile Number',
    chiefComplaint: 'Primary Health Complaint',
    enterVitals: 'Clinical Vitals (Self or Kiosk Assist)',
    heartRate: 'Heart Rate (BPM)',
    bloodPressure: 'Blood Pressure (Systolic/Diastolic)',
    spO2: 'Oxygen Saturation (SpO2 %)',
    temp: 'Temperature (°F)',
    painLevel: 'Pain Scale (0 - 10)',
    submitCheckin: 'Generate Token & AI Triage',
    triageCategory: 'Urgency Category',
    assignedDept: 'Assigned Department',
    estimatedWait: 'Estimated Wait Time',
    currentPosition: 'Queue Position',
    emergencyAlert: 'Critical Congestion Warning',
    executeRecommendation: 'Execute AI Allocation',
    occupiedBeds: 'Bed Occupancy',
    activeDoctors: 'Doctors On Duty',
    waitingOPD: 'Waiting in OPD',
    callNext: 'Call Next Patient',
    startConsultation: 'Start Consultation',
    sendToDiagnostics: 'Send to Diagnostics / Lab',
    admitPatient: 'Admit Patient',
    dischargePatient: 'Discharge Patient',
  },
  hi: {
    appTitle: 'टेक वोएजर | एआई अस्पताल प्रबंधन',
    patientPortal: 'मरीज़ पोर्टल',
    commandCenter: 'कमांड सेंटर',
    doctorPortal: 'डॉक्टर क्लिनिक',
    surgeSimulator: 'आपातकालीन सिम्युलेटर',
    selfCheckIn: 'स्वयं पंजीकरण और ओपीडी टोकन',
    liveTracker: 'लाइव टोकन ट्रैकर',
    hospitalRoute: 'अस्पताल मार्ग नक्शा',
    fullName: 'मरीज़ का पूरा नाम',
    age: 'उम्र (वर्ष)',
    gender: 'लिंग',
    phone: 'मोबाइल नंबर',
    chiefComplaint: 'मुख्य स्वास्थ्य समस्या',
    enterVitals: 'शारीरिक माप (वाइटल्स)',
    heartRate: 'हृदय गति (BPM)',
    bloodPressure: 'रक्तचाप (सिस्टोलिक/डायस्टोलिक)',
    spO2: 'ऑक्सीजन स्तर (SpO2 %)',
    temp: 'तापमान (°F)',
    painLevel: 'दर्द का स्तर (0 - 10)',
    submitCheckin: 'टोकन प्राप्त करें और एआई ट्राइएज',
    triageCategory: 'आपातकालीन श्रेणी',
    assignedDept: 'आवंटित विभाग',
    estimatedWait: 'अनुमानित प्रतीक्षा समय',
    currentPosition: 'कतार में स्थान',
    emergencyAlert: 'अत्यधिक भीड़ की चेतावनी',
    executeRecommendation: 'एआई संसाधन लागू करें',
    occupiedBeds: 'भरे हुए बिस्तर',
    activeDoctors: 'ड्यूटी पर डॉक्टर',
    waitingOPD: 'ओपीडी में प्रतीक्षारत',
    callNext: 'अगले मरीज़ को बुलाएं',
    startConsultation: 'परामर्श शुरू करें',
    sendToDiagnostics: 'जांच / लैब में भेजें',
    admitPatient: 'भर्ती करें',
    dischargePatient: 'छुट्टी दें',
  },
  ta: {
    appTitle: 'டெக் வாயேஜர் | AI மருத்துவமனை மேலாண்மை',
    patientPortal: 'நோயாளி போர்ட்டல்',
    commandCenter: 'கட்டளை மையம்',
    doctorPortal: 'மருத்துவர் பிரிவு',
    surgeSimulator: 'அவசர உருவகப்படுத்துதல்',
    selfCheckIn: 'சுய பதிவு & OPD டோக்கன்',
    liveTracker: 'நேரடி டோக்கன் டிராக்கர்',
    hospitalRoute: 'மருத்துவமனை வழி வரைபடம்',
    fullName: 'நோயாளியின் பெயர்',
    age: 'வயது',
    gender: 'பாலினம்',
    phone: 'அலைபேசி எண்',
    chiefComplaint: 'முக்கிய உடல்நலப் பிரச்சினை',
    enterVitals: 'உடல் அளவீடுகள் (Vitals)',
    heartRate: 'இதயத் துடிப்பு (BPM)',
    bloodPressure: 'இரத்த அழுத்தம்',
    spO2: 'ஆக்ஸிஜன் அளவு (SpO2 %)',
    temp: 'உடல் வெப்பநிலை (°F)',
    painLevel: 'வலி நிலை (0 - 10)',
    submitCheckin: 'டோக்கன் பெறுக & AI மதிப்பீடு',
    triageCategory: 'அவசர நிலை வகை',
    assignedDept: 'ஒதுக்கப்பட்ட துறை',
    estimatedWait: 'மதிப்பிடப்பட்ட காத்திருப்பு நேரம்',
    currentPosition: 'வரிசையில் இடம்',
    emergencyAlert: 'அவசர நெரிசல் எச்சரிக்கை',
    executeRecommendation: 'AI வழிகாட்டுதலை இயக்கு',
    occupiedBeds: 'நிரப்பப்பட்ட படுக்கைகள்',
    activeDoctors: 'பணியில் உள்ள மருத்துவர்கள்',
    waitingOPD: 'காத்திருக்கும் நோயாளிகள்',
    callNext: 'அடுத்த நோயாளியை அழைக்கவும்',
    startConsultation: 'ஆலோசனை தொடங்கவும்',
    sendToDiagnostics: 'பரிசோதனைக்கு அனுப்புக',
    admitPatient: 'அனுமதிக்கவும்',
    dischargePatient: 'டிஸ்சார்ஜ் செய்க',
  },
  bn: {
    appTitle: 'টেক ভয়েজার | এআই হাসপাতাল ফ্লো সিস্টেম',
    patientPortal: 'রোগী পোর্টাল',
    commandCenter: 'কমান্ড সেন্টার',
    doctorPortal: 'ডাক্তার ক্লিনিক',
    surgeSimulator: 'সার্জ সিমুলেটর',
    selfCheckIn: 'স্ব-নিবন্ধন ও ওপিডি টোকেন',
    liveTracker: 'লাইভ টোকেন ট্র্যাকার',
    hospitalRoute: 'হাসপাতাল রুট ম্যাপ',
    fullName: 'রোগীর পুরো নাম',
    age: 'বয়স',
    gender: 'লিঙ্গ',
    phone: 'মোবাইল নম্বর',
    chiefComplaint: 'প্রধান শারীরিক সমস্যা',
    enterVitals: 'ভাইটাল পরিমাপ',
    heartRate: 'হৃদস্পন্দন (BPM)',
    bloodPressure: 'রক্তচাপ (BP)',
    spO2: 'অক্সিজেন মাত্রা (SpO2 %)',
    temp: 'তাপমাত্রা (°F)',
    painLevel: 'ব্যথার মাত্রা (0 - 10)',
    submitCheckin: 'টোকেন তৈরি ও এআই ট্রায়াজ',
    triageCategory: 'জরুরী বিভাগ',
    assignedDept: 'বরাদ্দকৃত বিভাগ',
    estimatedWait: 'আনুমানিক অপেক্ষার সময়',
    currentPosition: 'লাইনের অবস্থান',
    emergencyAlert: 'ভিড়ের সতর্কতা',
    executeRecommendation: 'এআই নির্দেশ কার্যকর করুন',
    occupiedBeds: 'ভর্তি বেড',
    activeDoctors: 'অন-ডিউটি ডাক্তার',
    waitingOPD: 'অপেক্ষমাণ রোগী',
    callNext: 'পরবর্তী রোগীকে ডাকুন',
    startConsultation: 'পরামর্শ শুরু করুন',
    sendToDiagnostics: 'ল্যাবে পাঠান',
    admitPatient: 'ভর্তি করুন',
    dischargePatient: 'ছাড়পত্র দিন',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
