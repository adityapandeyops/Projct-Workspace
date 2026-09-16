import { Vitals, TriageAssessment, DepartmentType, TriageUrgency } from './hospitalStore.js';
import dotenv from 'dotenv';
dotenv.config();

export interface GeminiTriageRequest {
  name: string;
  age: number;
  gender: string;
  vitals: Vitals;
  chiefComplaint: string;
  symptoms: string[];
}

export interface GeminiTriageResponse {
  urgency: TriageUrgency;
  urgencyColor: 'red' | 'amber' | 'green' | 'blue';
  assignedDepartment: DepartmentType;
  priorityScore: number;
  estimatedWaitMinutes: number;
  redFlagWarnings: string[];
  aiClinicalSummary: string;
  admissionRiskPercent: number;
  recommendedDiagnostics: string[];
  clinicalRationale: string;
}

export class GeminiHealthcareService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  public async evaluateTriage(data: GeminiTriageRequest): Promise<GeminiTriageResponse> {
    // If Gemini API Key is configured, attempt calling Gemini
    if (this.apiKey) {
      try {
        const prompt = `You are a Senior Hospital Emergency Triage Physician AI.
Evaluate this incoming patient:
- Patient: ${data.name}, ${data.age} y/o ${data.gender}
- Chief Complaint: ${data.chiefComplaint}
- Symptoms: ${data.symptoms.join(', ')}
- Vitals:
  * Heart Rate: ${data.vitals.heartRate} bpm
  * Blood Pressure: ${data.vitals.bloodPressureSystolic}/${data.vitals.bloodPressureDiastolic} mmHg
  * SpO2: ${data.vitals.oxygenSaturation}%
  * Temperature: ${data.vitals.temperature}°F
  * Respiratory Rate: ${data.vitals.respiratoryRate} bpm
  * Pain Level (0-10): ${data.vitals.painLevel}

Respond ONLY in valid JSON matching this structure without markdown wraps:
{
  "urgency": "EMERGENCY" | "URGENT" | "ROUTINE" | "FAST_TRACK",
  "urgencyColor": "red" | "amber" | "green" | "blue",
  "assignedDepartment": "EMERGENCY" | "CARDIOLOGY" | "GENERAL_MEDICINE" | "ORTHOPEDICS" | "PEDIATRICS" | "RADIOLOGY" | "PATHOLOGY" | "ICU",
  "priorityScore": number (1 to 100),
  "estimatedWaitMinutes": number,
  "redFlagWarnings": string[],
  "aiClinicalSummary": string,
  "admissionRiskPercent": number (0 to 100),
  "recommendedDiagnostics": string[],
  "clinicalRationale": string
}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (res.ok) {
          const json: any = await res.json();
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return parsed as GeminiTriageResponse;
          }
        }
      } catch (err) {
        console.warn('Gemini API call encountered error, using medical heuristic fallback:', err);
      }
    }

    // Medical Deterministic Clinical Heuristic Fallback
    return this.fallbackClinicalAssessment(data);
  }

  public async generateClinicalNotes(patientData: any): Promise<string> {
    if (this.apiKey) {
      try {
        const prompt = `Generate a concise, professional clinical SOAP summary note for:
Patient: ${patientData.name}, ${patientData.age}yo ${patientData.gender}
Chief Complaint: ${patientData.triage.chiefComplaint}
Vitals: BP ${patientData.vitals.bloodPressureSystolic}/${patientData.vitals.bloodPressureDiastolic}, HR ${patientData.vitals.heartRate}, SpO2 ${patientData.vitals.oxygenSaturation}%, Temp ${patientData.vitals.temperature}°F
Triage: ${patientData.triage.urgency}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (res.ok) {
          const json: any = await res.json();
          return json?.candidates?.[0]?.content?.parts?.[0]?.text || this.fallbackClinicalNotes(patientData);
        }
      } catch (e) {
        // Fallback
      }
    }

    return this.fallbackClinicalNotes(patientData);
  }

  private fallbackClinicalAssessment(data: GeminiTriageRequest): GeminiTriageResponse {
    const vitals = data.vitals;
    let news2 = 0;
    const redFlags: string[] = [];

    if (vitals.oxygenSaturation <= 91) { news2 += 3; redFlags.push('Critical Hypoxia (SpO2 <= 91%)'); }
    else if (vitals.oxygenSaturation <= 93) { news2 += 2; redFlags.push('Borderline Low SpO2'); }

    if (vitals.bloodPressureSystolic <= 90) { news2 += 3; redFlags.push('Hypotensive Shock (BP <= 90)'); }
    else if (vitals.bloodPressureSystolic >= 175) { news2 += 2; redFlags.push('Severe Hypertension'); }

    if (vitals.heartRate >= 125 || vitals.heartRate <= 45) { news2 += 3; redFlags.push('Severe Tachy/Bradycardia'); }
    if (vitals.temperature >= 102.5) { news2 += 2; redFlags.push('Hyperpyrexia (>102.5°F)'); }
    if (vitals.painLevel >= 8) { redFlags.push('Severe Acute Pain (Score >= 8)'); }

    const complaint = (data.chiefComplaint + ' ' + data.symptoms.join(' ')).toLowerCase();
    let urgency: TriageUrgency = 'ROUTINE';
    let urgencyColor: GeminiTriageResponse['urgencyColor'] = 'green';
    let priorityScore = 35;
    let waitMinutes = 20;
    let dept: DepartmentType = 'GENERAL_MEDICINE';
    let admissionRisk = 10;
    const diagnostics: string[] = ['Complete Blood Count (CBC)'];

    if (complaint.includes('chest') || complaint.includes('cardiac') || complaint.includes('palpitation') || vitals.bloodPressureSystolic >= 165) {
      dept = 'CARDIOLOGY';
      diagnostics.push('12-Lead ECG Stat', 'Serum Troponin-I', 'Echocardiogram');
      priorityScore += 25;
    } else if (complaint.includes('fracture') || complaint.includes('trauma') || complaint.includes('bone') || complaint.includes('knee') || complaint.includes('joint')) {
      dept = 'ORTHOPEDICS';
      diagnostics.push('Digital X-Ray', 'Orthopedic Consult');
    } else if (data.age <= 12 || complaint.includes('pediatric') || complaint.includes('child')) {
      dept = 'PEDIATRICS';
      diagnostics.push('Rapid Dengue NS1', 'Serum Electrolytes');
    }

    if (news2 >= 6 || redFlags.length >= 2 || complaint.includes('unconscious') || complaint.includes('accident') || complaint.includes('severe bleeding')) {
      urgency = 'EMERGENCY';
      urgencyColor = 'red';
      priorityScore = 95;
      waitMinutes = 0;
      dept = 'EMERGENCY';
      admissionRisk = 90;
      diagnostics.unshift('Stat eFAST Scan', 'Arterial Blood Gas (ABG)');
    } else if (news2 >= 3 || redFlags.length >= 1 || vitals.painLevel >= 7) {
      urgency = 'URGENT';
      urgencyColor = 'amber';
      priorityScore = 70;
      waitMinutes = 10;
      admissionRisk = 40;
    } else if (data.symptoms.length <= 1 && vitals.painLevel <= 3 && news2 === 0) {
      urgency = 'FAST_TRACK';
      urgencyColor = 'blue';
      priorityScore = 20;
      waitMinutes = 12;
      admissionRisk = 5;
    }

    return {
      urgency,
      urgencyColor,
      assignedDepartment: dept,
      priorityScore,
      estimatedWaitMinutes: waitMinutes,
      redFlagWarnings: redFlags,
      aiClinicalSummary: `AI Triage: ${urgency} category (NEWS2: ${news2}). Vitals: HR ${vitals.heartRate}, BP ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}, SpO2 ${vitals.oxygenSaturation}%, Temp ${vitals.temperature}°F. ${redFlags.length > 0 ? redFlags.join(', ') : 'Hemodynamically stable.'}`,
      admissionRiskPercent: admissionRisk,
      recommendedDiagnostics: diagnostics,
      clinicalRationale: `Assessed based on clinical risk indicators, early warning score (NEWS2: ${news2}), and chief complaint symptoms.`
    };
  }

  private fallbackClinicalNotes(patientData: any): string {
    return `CLINICAL SUMMARY NOTE
Patient: ${patientData.name} (${patientData.age}y / ${patientData.gender})
Arrival: ${new Date(patientData.arrivalTime).toLocaleTimeString()}
Chief Complaint: ${patientData.triage?.chiefComplaint || 'N/A'}
Triage Category: ${patientData.triage?.urgency || 'ROUTINE'} (Priority: ${patientData.triage?.priorityScore}/100)

VITALS:
- BP: ${patientData.vitals?.bloodPressureSystolic}/${patientData.vitals?.bloodPressureDiastolic} mmHg
- HR: ${patientData.vitals?.heartRate} bpm | SpO2: ${patientData.vitals?.oxygenSaturation}%
- Temp: ${patientData.vitals?.temperature}°F | RR: ${patientData.vitals?.respiratoryRate} /min

ASSESSMENT & PLAN:
1. Patient presented with ${patientData.triage?.symptoms?.join(', ') || 'symptoms as noted'}.
2. Immediate diagnostic requisitions ordered.
3. Keep under observation and titrate medication based on lab results.`;
  }
}

export const geminiService = new GeminiHealthcareService();
