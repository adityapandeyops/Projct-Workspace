export type TriageUrgency = 'EMERGENCY' | 'URGENT' | 'ROUTINE' | 'FAST_TRACK';

export type PatientStage = 
  | 'REGISTRATION'
  | 'TRIAGE'
  | 'WAITING_OPD'
  | 'IN_CONSULTATION'
  | 'DIAGNOSTICS'
  | 'PHARMACY'
  | 'ADMITTED'
  | 'DISCHARGED';

export type DepartmentType = 
  | 'EMERGENCY'
  | 'CARDIOLOGY'
  | 'GENERAL_MEDICINE'
  | 'ORTHOPEDICS'
  | 'PEDIATRICS'
  | 'RADIOLOGY'
  | 'PATHOLOGY'
  | 'ICU';

export interface Vitals {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  oxygenSaturation: number;
  temperature: number;
  respiratoryRate: number;
  painLevel: number;
}

export interface TriageAssessment {
  urgency: TriageUrgency;
  urgencyColor: 'red' | 'amber' | 'green' | 'blue';
  news2Score: number;
  priorityScore: number;
  assignedDepartment: DepartmentType;
  recommendedChamber: string;
  estimatedWaitMinutes: number;
  chiefComplaint: string;
  symptoms: string[];
  redFlagWarnings: string[];
  aiClinicalSummary: string;
  admissionRiskPercent: number;
  recommendedDiagnostics: string[];
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface LabOrderItem {
  id: string;
  testName: string;
  department: 'RADIOLOGY' | 'PATHOLOGY';
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'IN_PROGRESS' | 'COMPLETED';
  resultSummary?: string;
  orderedAt: string;
}

export interface Patient {
  id: string;
  tokenNumber: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  abhaId?: string;
  nationalId?: string;
  languagePreference: 'en' | 'hi' | 'ta' | 'bn';
  stage: PatientStage;
  queuePosition: number;
  vitals: Vitals;
  triage: TriageAssessment;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  assignedBedId?: string;
  assignedWard?: string;
  arrivalTime: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  dischargeReadinessScore?: number;
  clinicalNotes?: string;
  prescriptions?: PrescriptionItem[];
  labOrders?: LabOrderItem[];
}

export type BedType = 'ICU' | 'EMERGENCY' | 'HDU' | 'GENERAL';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'RESERVED_EMERGENCY';

export interface Bed {
  id: string;
  bedNumber: string;
  ward: string;
  type: BedType;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  admittedAt?: string;
  estimatedDischargeTime?: string;
  oxygenSupported: boolean;
  ventilatorAttached: boolean;
  dischargeReadinessScore?: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: DepartmentType;
  chamberNumber: string;
  status: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_BREAK' | 'EMERGENCY_DUTY' | 'OFF_DUTY';
  currentPatientId?: string;
  currentPatientToken?: string;
  patientsServedToday: number;
  avgConsultationMinutes: number;
  activeQueueCount: number;
}

export interface DepartmentMetrics {
  department: DepartmentType;
  displayName: string;
  currentQueueLength: number;
  activeDoctorsCount: number;
  avgWaitTimeMinutes: number;
  congestionPercent: number;
  congestionLevel: 'LOW' | 'OPTIMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  statusDescription: string;
  capacity?: number;
}

export interface AIResourceRecommendation {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  suggestedAction: string;
  sourceDepartment: DepartmentType;
  targetDepartment?: DepartmentType;
  actionPayload?: {
    type: 'SHIFT_DOCTOR' | 'ALLOCATE_EXTRA_BEDS' | 'FAST_TRACK_DISCHARGE' | 'OPEN_SURGE_CHAMBER' | 'ACTIVATE_CODE_YELLOW';
    doctorId?: string;
    bedIds?: string[];
    roomNumber?: string;
  };
  isExecuted: boolean;
}

export interface HospitalStats {
  totalPatientsToday: number;
  activeInHospital: number;
  waitingInOPD: number;
  inConsultation: number;
  inDiagnostics: number;
  currentlyAdmitted: number;
  dischargedToday: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  icuOccupancyPercent: number;
  overallBedOccupancyPercent: number;
  avgWaitTimeMinutes: number;
  avgLengthOfStayHours: number;
  hourlyArrivals: { hour: string; arrivals: number; departures: number }[];
  waitTimesByDept: { department: string; waitTime: number }[];
  bedOccupancyByWard: { ward: string; occupied: number; total: number; percent: number }[];
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'BED' | 'DOCTOR' | 'DEPARTMENT' | 'BROADCAST' | 'AI';
  details: string;
  performedBy: string;
}

export interface HospitalBroadcastAlert {
  id: string;
  timestamp: string;
  code: 'CODE_RED' | 'CODE_BLUE' | 'CODE_YELLOW' | 'GENERAL_ANNOUNCEMENT';
  title: string;
  message: string;
  targetWards?: string[];
  active: boolean;
}

export class HospitalDataStore {
  private patients: Patient[] = [];
  private beds: Bed[] = [];
  private doctors: Doctor[] = [];
  private recommendations: AIResourceRecommendation[] = [];
  private auditLogs: AdminAuditLog[] = [];
  private activeBroadcasts: HospitalBroadcastAlert[] = [];
  private departmentCapacities: Record<DepartmentType, number> = {
    EMERGENCY: 10,
    CARDIOLOGY: 12,
    GENERAL_MEDICINE: 20,
    ORTHOPEDICS: 12,
    PEDIATRICS: 15,
    RADIOLOGY: 14,
    PATHOLOGY: 25,
    ICU: 8,
  };
  private tokenCounter = 120;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed Doctors
    this.doctors = [
      { id: 'doc-1', name: 'Dr. Rajesh Sharma', specialty: 'General Physician', department: 'GENERAL_MEDICINE', chamberNumber: 'Chamber 101', status: 'AVAILABLE', patientsServedToday: 18, avgConsultationMinutes: 7, activeQueueCount: 4 },
      { id: 'doc-2', name: 'Dr. Ananya Mukherjee', specialty: 'Senior Consultant', department: 'GENERAL_MEDICINE', chamberNumber: 'Chamber 102', status: 'IN_CONSULTATION', currentPatientId: 'pat-1', currentPatientToken: 'TV-OPD-101', patientsServedToday: 22, avgConsultationMinutes: 6, activeQueueCount: 3 },
      { id: 'doc-3', name: 'Dr. Vikram Patel', specialty: 'Cardiologist', department: 'CARDIOLOGY', chamberNumber: 'Chamber 204', status: 'IN_CONSULTATION', currentPatientId: 'pat-2', currentPatientToken: 'TV-OPD-102', patientsServedToday: 14, avgConsultationMinutes: 12, activeQueueCount: 3 },
      { id: 'doc-4', name: 'Dr. Sunita Rao', specialty: 'Interventional Cardiology', department: 'CARDIOLOGY', chamberNumber: 'Chamber 205', status: 'AVAILABLE', patientsServedToday: 11, avgConsultationMinutes: 10, activeQueueCount: 2 },
      { id: 'doc-5', name: 'Dr. Priya Nambiar', specialty: 'Chief Pediatrician', department: 'PEDIATRICS', chamberNumber: 'Chamber 108', status: 'IN_CONSULTATION', currentPatientId: 'pat-3', currentPatientToken: 'TV-OPD-103', patientsServedToday: 25, avgConsultationMinutes: 8, activeQueueCount: 5 },
      { id: 'doc-6', name: 'Dr. Amitav Ghosh', specialty: 'Pediatric Specialist', department: 'PEDIATRICS', chamberNumber: 'Chamber 109', status: 'AVAILABLE', patientsServedToday: 19, avgConsultationMinutes: 7, activeQueueCount: 4 },
      { id: 'doc-7', name: 'Dr. Rohan Verma', specialty: 'Orthopedic Surgeon', department: 'ORTHOPEDICS', chamberNumber: 'Chamber 301', status: 'AVAILABLE', patientsServedToday: 15, avgConsultationMinutes: 9, activeQueueCount: 2 },
      { id: 'doc-8', name: 'Dr. Meera Sengupta', specialty: 'Emergency Physician', department: 'EMERGENCY', chamberNumber: 'ER Bay 1', status: 'EMERGENCY_DUTY', currentPatientId: 'pat-4', currentPatientToken: 'TV-ER-001', patientsServedToday: 31, avgConsultationMinutes: 15, activeQueueCount: 2 },
      { id: 'doc-9', name: 'Dr. Tariq Khan', specialty: 'Emergency Traumatologist', department: 'EMERGENCY', chamberNumber: 'ER Bay 2', status: 'EMERGENCY_DUTY', patientsServedToday: 28, avgConsultationMinutes: 14, activeQueueCount: 1 },
      { id: 'doc-10', name: 'Dr. Shalini Deshmukh', specialty: 'Chief Radiologist', department: 'RADIOLOGY', chamberNumber: 'Imaging Suite A', status: 'AVAILABLE', patientsServedToday: 35, avgConsultationMinutes: 5, activeQueueCount: 3 },
      { id: 'doc-11', name: 'Dr. Harish Bhat', specialty: 'Pathology Director', department: 'PATHOLOGY', chamberNumber: 'Central Lab', status: 'AVAILABLE', patientsServedToday: 42, avgConsultationMinutes: 4, activeQueueCount: 4 },
      { id: 'doc-12', name: 'Dr. Deepa Nair', specialty: 'Critical Care Lead', department: 'ICU', chamberNumber: 'ICU Control', status: 'EMERGENCY_DUTY', patientsServedToday: 8, avgConsultationMinutes: 25, activeQueueCount: 0 },
    ];

    // Seed 48 Beds across 4 wards
    const wards: { ward: string; type: BedType; count: number; prefix: string; oxygen: boolean; vent: boolean }[] = [
      { ward: 'Emergency Trauma Ward', type: 'EMERGENCY', count: 12, prefix: 'ER', oxygen: true, vent: false },
      { ward: 'Intensive Coronary Care Unit', type: 'ICU', count: 8, prefix: 'ICU', oxygen: true, vent: true },
      { ward: 'High Dependency Unit (HDU)', type: 'HDU', count: 8, prefix: 'HDU', oxygen: true, vent: false },
      { ward: 'General Ward A (Male)', type: 'GENERAL', count: 10, prefix: 'GWA', oxygen: false, vent: false },
      { ward: 'General Ward B (Female)', type: 'GENERAL', count: 10, prefix: 'GWB', oxygen: false, vent: false },
    ];

    let bedIndex = 1;
    for (const w of wards) {
      for (let i = 1; i <= w.count; i++) {
        const isOccupied = (i % 3 === 0) || (w.type === 'ICU' && i <= 6) || (w.type === 'EMERGENCY' && i <= 8);
        const isCleaning = !isOccupied && (i % 5 === 0);
        this.beds.push({
          id: `bed-${bedIndex++}`,
          bedNumber: `${w.prefix}-${i.toString().padStart(2, '0')}`,
          ward: w.ward,
          type: w.type,
          status: isOccupied ? 'OCCUPIED' : (isCleaning ? 'CLEANING' : 'AVAILABLE'),
          patientId: isOccupied ? `pat-adm-${i}` : undefined,
          patientName: isOccupied ? `Admitted Patient ${i}` : undefined,
          admittedAt: isOccupied ? new Date(Date.now() - (i * 3600000 * 8)).toISOString() : undefined,
          estimatedDischargeTime: isOccupied ? new Date(Date.now() + (i * 3600000 * 4)).toISOString() : undefined,
          oxygenSupported: w.oxygen,
          ventilatorAttached: w.vent,
          dischargeReadinessScore: isOccupied ? Math.min(95, Math.max(20, 40 + i * 5)) : undefined,
        });
      }
    }

    // Seed Active Patients
    this.patients = [
      {
        id: 'pat-1',
        tokenNumber: 'TV-OPD-101',
        name: 'Rameshwar Gupta',
        age: 58,
        gender: 'MALE',
        phone: '+91 98765 43210',
        abhaId: '91-4589-2384-9012',
        languagePreference: 'hi',
        stage: 'IN_CONSULTATION',
        queuePosition: 1,
        vitals: { heartRate: 88, bloodPressureSystolic: 142, bloodPressureDiastolic: 92, oxygenSaturation: 97, temperature: 98.6, respiratoryRate: 18, painLevel: 3 },
        triage: {
          urgency: 'ROUTINE',
          urgencyColor: 'green',
          news2Score: 1,
          priorityScore: 45,
          assignedDepartment: 'GENERAL_MEDICINE',
          recommendedChamber: 'Chamber 102',
          estimatedWaitMinutes: 0,
          chiefComplaint: 'Persistent cough for 2 weeks with fatigue',
          symptoms: ['Cough', 'Fatigue', 'Mild headache'],
          redFlagWarnings: [],
          aiClinicalSummary: '58M with subacute dry cough and mild hypertension. Stable vitals, low acute risk.',
          admissionRiskPercent: 12,
          recommendedDiagnostics: ['Chest X-Ray', 'CBC'],
        },
        assignedDoctorId: 'doc-2',
        assignedDoctorName: 'Dr. Ananya Mukherjee',
        arrivalTime: new Date(Date.now() - 45 * 60000).toISOString(),
        consultationStartTime: new Date(Date.now() - 5 * 60000).toISOString(),
        prescriptions: [
          { id: 'rx-1', medicineName: 'Levocetirizine 5mg', dosage: '1 Tab', frequency: 'Once daily (Night)', duration: '5 days', instructions: 'After meals' },
          { id: 'rx-2', medicineName: 'Amoxicillin-Clavulanate 625mg', dosage: '1 Tab', frequency: 'Twice daily', duration: '5 days', instructions: 'Complete full course' }
        ],
        labOrders: [
          { id: 'lab-1', testName: 'Chest X-Ray PA View', department: 'RADIOLOGY', status: 'IN_PROGRESS', orderedAt: new Date(Date.now() - 20 * 60000).toISOString() }
        ]
      },
      {
        id: 'pat-2',
        tokenNumber: 'TV-OPD-102',
        name: 'Kavita Sundaram',
        age: 64,
        gender: 'FEMALE',
        phone: '+91 98450 11223',
        abhaId: '91-1122-3344-5566',
        languagePreference: 'ta',
        stage: 'IN_CONSULTATION',
        queuePosition: 1,
        vitals: { heartRate: 104, bloodPressureSystolic: 165, bloodPressureDiastolic: 102, oxygenSaturation: 94, temperature: 99.1, respiratoryRate: 22, painLevel: 7 },
        triage: {
          urgency: 'URGENT',
          urgencyColor: 'amber',
          news2Score: 5,
          priorityScore: 78,
          assignedDepartment: 'CARDIOLOGY',
          recommendedChamber: 'Chamber 204',
          estimatedWaitMinutes: 0,
          chiefComplaint: 'Substernal chest heaviness radiating to left shoulder',
          symptoms: ['Chest Pain', 'Shortness of Breath', 'Palpitations', 'Sweating'],
          redFlagWarnings: ['High Systolic BP (>160)', 'Tachycardia HR>100', 'Borderline SpO2 (94%)'],
          aiClinicalSummary: '64F presenting with classic angina symptoms and stage 2 hypertension. High suspicion of Acute Coronary Syndrome.',
          admissionRiskPercent: 82,
          recommendedDiagnostics: ['12-Lead ECG Stat', 'Troponin-I', 'Echocardiogram'],
        },
        assignedDoctorId: 'doc-3',
        assignedDoctorName: 'Dr. Vikram Patel',
        arrivalTime: new Date(Date.now() - 30 * 60000).toISOString(),
        consultationStartTime: new Date(Date.now() - 8 * 60000).toISOString(),
        labOrders: [
          { id: 'lab-2', testName: '12-Lead ECG Stat', department: 'CARDIOLOGY' as any, status: 'COMPLETED', resultSummary: 'ST depression in V4-V6', orderedAt: new Date(Date.now() - 15 * 60000).toISOString() },
          { id: 'lab-3', testName: 'Cardiac Troponin-I', department: 'PATHOLOGY', status: 'IN_PROGRESS', orderedAt: new Date(Date.now() - 10 * 60000).toISOString() }
        ]
      },
      {
        id: 'pat-3',
        tokenNumber: 'TV-OPD-103',
        name: 'Master Aarav Jain',
        age: 6,
        gender: 'MALE',
        phone: '+91 97110 54321',
        languagePreference: 'hi',
        stage: 'IN_CONSULTATION',
        queuePosition: 1,
        vitals: { heartRate: 118, bloodPressureSystolic: 100, bloodPressureDiastolic: 65, oxygenSaturation: 98, temperature: 102.4, respiratoryRate: 24, painLevel: 4 },
        triage: {
          urgency: 'URGENT',
          urgencyColor: 'amber',
          news2Score: 3,
          priorityScore: 68,
          assignedDepartment: 'PEDIATRICS',
          recommendedChamber: 'Chamber 108',
          estimatedWaitMinutes: 0,
          chiefComplaint: 'High-grade fever (102.4°F) for 3 days with vomiting',
          symptoms: ['Fever', 'Vomiting', 'Lethargy', 'Poor oral intake'],
          redFlagWarnings: ['High Pediatric Fever (>102°F)', 'Dehydration risk'],
          aiClinicalSummary: '6yo pediatric male with persistent high fever and multiple emesis episodes. Hydration assessment critical.',
          admissionRiskPercent: 35,
          recommendedDiagnostics: ['Rapid Dengue NS1 Antigen', 'Complete Blood Count (CBC)', 'Serum Electrolytes'],
        },
        assignedDoctorId: 'doc-5',
        assignedDoctorName: 'Dr. Priya Nambiar',
        arrivalTime: new Date(Date.now() - 25 * 60000).toISOString(),
        consultationStartTime: new Date(Date.now() - 4 * 60000).toISOString(),
      },
      {
        id: 'pat-4',
        tokenNumber: 'TV-ER-001',
        name: 'Suresh Menon',
        age: 42,
        gender: 'MALE',
        phone: '+91 99887 76655',
        languagePreference: 'en',
        stage: 'IN_CONSULTATION',
        queuePosition: 1,
        vitals: { heartRate: 126, bloodPressureSystolic: 85, bloodPressureDiastolic: 55, oxygenSaturation: 89, temperature: 97.8, respiratoryRate: 28, painLevel: 9 },
        triage: {
          urgency: 'EMERGENCY',
          urgencyColor: 'red',
          news2Score: 9,
          priorityScore: 98,
          assignedDepartment: 'EMERGENCY',
          recommendedChamber: 'ER Bay 1',
          estimatedWaitMinutes: 0,
          chiefComplaint: 'Road traffic accident: Blunt chest trauma and acute respiratory distress',
          symptoms: ['Severe Pain', 'Dyspnea', 'Hypotension', 'Tachypnea'],
          redFlagWarnings: ['Severe Hypoxia (SpO2 89%)', 'Hypotensive Shock (BP 85/55)', 'Critical NEWS2 Score (9)'],
          aiClinicalSummary: '42M polytrauma victim with unstable hemodynamics, critical hypoxia, and severe tachycardia. Immediate trauma resuscitation protocol active.',
          admissionRiskPercent: 96,
          recommendedDiagnostics: ['eFAST Ultrasound', 'CT Trauma Whole Body', 'Crossmatch 4 Units PRBC'],
        },
        assignedDoctorId: 'doc-8',
        assignedDoctorName: 'Dr. Meera Sengupta',
        assignedBedId: 'bed-1',
        assignedWard: 'Emergency Trauma Ward',
        arrivalTime: new Date(Date.now() - 15 * 60000).toISOString(),
        consultationStartTime: new Date(Date.now() - 12 * 60000).toISOString(),
      },
      {
        id: 'pat-5',
        tokenNumber: 'TV-OPD-104',
        name: 'Sunita Banerjee',
        age: 51,
        gender: 'FEMALE',
        phone: '+91 93344 55667',
        abhaId: '91-7788-9900-1122',
        languagePreference: 'bn',
        stage: 'WAITING_OPD',
        queuePosition: 1,
        vitals: { heartRate: 76, bloodPressureSystolic: 128, bloodPressureDiastolic: 82, oxygenSaturation: 98, temperature: 98.4, respiratoryRate: 16, painLevel: 6 },
        triage: {
          urgency: 'ROUTINE',
          urgencyColor: 'green',
          news2Score: 0,
          priorityScore: 35,
          assignedDepartment: 'ORTHOPEDICS',
          recommendedChamber: 'Chamber 301',
          estimatedWaitMinutes: 8,
          chiefComplaint: 'Severe right knee pain and swelling after twisting ankle',
          symptoms: ['Joint Pain', 'Swelling', 'Difficulty walking'],
          redFlagWarnings: [],
          aiClinicalSummary: '51F with acute mechanical knee strain and localized effusion. Hemodynamically stable.',
          admissionRiskPercent: 8,
          recommendedDiagnostics: ['X-Ray Right Knee AP/Lateral', 'Uric Acid Serum'],
        },
        assignedDoctorId: 'doc-7',
        assignedDoctorName: 'Dr. Rohan Verma',
        arrivalTime: new Date(Date.now() - 18 * 60000).toISOString(),
      },
      {
        id: 'pat-6',
        tokenNumber: 'TV-OPD-105',
        name: 'Deepak Chopra',
        age: 34,
        gender: 'MALE',
        phone: '+91 98112 34567',
        languagePreference: 'en',
        stage: 'WAITING_OPD',
        queuePosition: 2,
        vitals: { heartRate: 82, bloodPressureSystolic: 130, bloodPressureDiastolic: 84, oxygenSaturation: 99, temperature: 98.8, respiratoryRate: 16, painLevel: 2 },
        triage: {
          urgency: 'ROUTINE',
          urgencyColor: 'green',
          news2Score: 0,
          priorityScore: 28,
          assignedDepartment: 'GENERAL_MEDICINE',
          recommendedChamber: 'Chamber 101',
          estimatedWaitMinutes: 14,
          chiefComplaint: 'Chronic acidity, bloating and dyspepsia for 1 month',
          symptoms: ['Acidity', 'Bloating', 'Nausea'],
          redFlagWarnings: [],
          aiClinicalSummary: '34M with gastroesophageal reflux symptoms. Stable vitals.',
          admissionRiskPercent: 5,
          recommendedDiagnostics: ['H. Pylori Serology', 'Abdominal Ultrasound'],
        },
        assignedDoctorId: 'doc-1',
        assignedDoctorName: 'Dr. Rajesh Sharma',
        arrivalTime: new Date(Date.now() - 12 * 60000).toISOString(),
      },
      {
        id: 'pat-7',
        tokenNumber: 'TV-OPD-106',
        name: 'Pooja Varma',
        age: 29,
        gender: 'FEMALE',
        phone: '+91 94567 89012',
        languagePreference: 'hi',
        stage: 'WAITING_OPD',
        queuePosition: 2,
        vitals: { heartRate: 92, bloodPressureSystolic: 118, bloodPressureDiastolic: 78, oxygenSaturation: 98, temperature: 100.2, respiratoryRate: 18, painLevel: 5 },
        triage: {
          urgency: 'ROUTINE',
          urgencyColor: 'green',
          news2Score: 1,
          priorityScore: 42,
          assignedDepartment: 'GENERAL_MEDICINE',
          recommendedChamber: 'Chamber 102',
          estimatedWaitMinutes: 18,
          chiefComplaint: 'Body aches, mild fever and sore throat',
          symptoms: ['Fever', 'Sore Throat', 'Myalgia'],
          redFlagWarnings: [],
          aiClinicalSummary: '29F presenting with upper respiratory tract viral infection symptoms.',
          admissionRiskPercent: 6,
          recommendedDiagnostics: ['Rapid Throat Swab', 'CBC'],
        },
        assignedDoctorId: 'doc-2',
        assignedDoctorName: 'Dr. Ananya Mukherjee',
        arrivalTime: new Date(Date.now() - 10 * 60000).toISOString(),
      },
      {
        id: 'pat-8',
        tokenNumber: 'TV-OPD-107',
        name: 'Mohammed Arshad',
        age: 49,
        gender: 'MALE',
        phone: '+91 98332 11445',
        languagePreference: 'en',
        stage: 'DIAGNOSTICS',
        queuePosition: 2,
        vitals: { heartRate: 86, bloodPressureSystolic: 138, bloodPressureDiastolic: 88, oxygenSaturation: 97, temperature: 98.6, respiratoryRate: 16, painLevel: 4 },
        triage: {
          urgency: 'ROUTINE',
          urgencyColor: 'green',
          news2Score: 0,
          priorityScore: 38,
          assignedDepartment: 'CARDIOLOGY',
          recommendedChamber: 'Chamber 204',
          estimatedWaitMinutes: 0,
          chiefComplaint: 'Routine cardiac checkup, post-angioplasty 6 months follow-up',
          symptoms: ['Mild exertional fatigue'],
          redFlagWarnings: [],
          aiClinicalSummary: '49M for scheduled post-PCI evaluation. In radiology for Echocardiography.',
          admissionRiskPercent: 15,
          recommendedDiagnostics: ['Echocardiogram', 'Lipid Profile'],
        },
        assignedDoctorId: 'doc-3',
        assignedDoctorName: 'Dr. Vikram Patel',
        arrivalTime: new Date(Date.now() - 55 * 60000).toISOString(),
        labOrders: [
          { id: 'lab-4', testName: '2D Echocardiography', department: 'RADIOLOGY', status: 'IN_PROGRESS', orderedAt: new Date(Date.now() - 25 * 60000).toISOString() }
        ]
      }
    ];

    // Initial AI Resource Recommendations
    this.recommendations = [
      {
        id: 'rec-1',
        timestamp: new Date().toISOString(),
        severity: 'WARNING',
        title: 'Pediatrics OPD Influx Surge Detected',
        description: 'Pediatric queue load is at 84% capacity with an average wait time of 28 minutes.',
        suggestedAction: 'Reassign Dr. Amitav Ghosh from Tele-Consultation to Active Room 109 to balance queue.',
        sourceDepartment: 'PEDIATRICS',
        targetDepartment: 'PEDIATRICS',
        actionPayload: {
          type: 'OPEN_SURGE_CHAMBER',
          doctorId: 'doc-6',
          roomNumber: 'Chamber 109'
        },
        isExecuted: false
      },
      {
        id: 'rec-2',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
        title: 'ICU Bed Availability Advisory',
        description: '2 General Ward patients (GWA-03, GWB-07) have reached 90% Discharge Readiness Score.',
        suggestedAction: 'Trigger Fast-Track Discharge to free up 2 secondary beds and streamline turnover.',
        sourceDepartment: 'ICU',
        actionPayload: {
          type: 'FAST_TRACK_DISCHARGE',
          bedIds: ['bed-3', 'bed-7']
        },
        isExecuted: false
      }
    ];

    // Initial Audit Logs
    this.auditLogs = [
      { id: 'log-1', timestamp: new Date(Date.now() - 60 * 60000).toISOString(), action: 'SYSTEM_BOOT', category: 'AI', details: 'Reactive Hospital In-Memory State Store initialized with 48 beds and 12 doctors.', performedBy: 'System Engine' },
      { id: 'log-2', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), action: 'ROSTER_SYNC', category: 'DOCTOR', details: 'Active clinical stations confirmed for Emergency, Cardiology and Pediatrics.', performedBy: 'Admin (Medical Superintendent)' }
    ];
  }

  // --- Patients API ---
  public getPatients(): Patient[] {
    return this.patients;
  }

  public getPatientById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id || p.tokenNumber === id);
  }

  public registerPatient(data: {
    name: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone: string;
    abhaId?: string;
    languagePreference: 'en' | 'hi' | 'ta' | 'bn';
    vitals: Vitals;
    chiefComplaint: string;
    symptoms: string[];
  }): Patient {
    this.tokenCounter++;
    const tokenNumber = `TV-OPD-${this.tokenCounter}`;
    const id = `pat-${Date.now()}`;

    // Compute Clinical Triage
    const triage = this.calculateTriageAssessment(data.vitals, data.chiefComplaint, data.symptoms);

    // Auto-assign doctor based on department
    const availableDoctor = this.doctors.find(d => d.department === triage.assignedDepartment && d.status === 'AVAILABLE')
      || this.doctors.find(d => d.department === triage.assignedDepartment)
      || this.doctors[0];

    const departmentQueue = this.patients.filter(p => 
      p.triage.assignedDepartment === triage.assignedDepartment && 
      (p.stage === 'WAITING_OPD' || p.stage === 'TRIAGE')
    );

    const newPatient: Patient = {
      id,
      tokenNumber,
      name: data.name,
      age: data.age,
      gender: data.gender,
      phone: data.phone,
      abhaId: data.abhaId,
      languagePreference: data.languagePreference,
      stage: triage.urgency === 'EMERGENCY' ? 'IN_CONSULTATION' : 'WAITING_OPD',
      queuePosition: triage.urgency === 'EMERGENCY' ? 1 : departmentQueue.length + 1,
      vitals: data.vitals,
      triage,
      assignedDoctorId: availableDoctor?.id,
      assignedDoctorName: availableDoctor?.name,
      arrivalTime: new Date().toISOString(),
    };

    if (triage.urgency === 'EMERGENCY') {
      const emergencyBed = this.beds.find(b => b.type === 'EMERGENCY' && b.status === 'AVAILABLE');
      if (emergencyBed) {
        emergencyBed.status = 'OCCUPIED';
        emergencyBed.patientId = newPatient.id;
        emergencyBed.patientName = newPatient.name;
        emergencyBed.admittedAt = new Date().toISOString();
        newPatient.assignedBedId = emergencyBed.id;
        newPatient.assignedWard = emergencyBed.ward;
      }
    }

    this.patients.unshift(newPatient);
    this.recalculateAllQueuesAndMetrics();
    return newPatient;
  }

  public updatePatientStage(patientId: string, stage: PatientStage, additionalData?: Partial<Patient>): Patient | null {
    const patient = this.patients.find(p => p.id === patientId || p.tokenNumber === patientId);
    if (!patient) return null;

    patient.stage = stage;
    if (stage === 'IN_CONSULTATION' && !patient.consultationStartTime) {
      patient.consultationStartTime = new Date().toISOString();
    }
    if (stage === 'DISCHARGED') {
      patient.consultationEndTime = new Date().toISOString();
      if (patient.assignedBedId) {
        const bed = this.beds.find(b => b.id === patient.assignedBedId);
        if (bed) {
          bed.status = 'CLEANING';
          bed.patientId = undefined;
          bed.patientName = undefined;
          setTimeout(() => {
            if (bed.status === 'CLEANING') bed.status = 'AVAILABLE';
          }, 20000);
        }
      }
    }

    if (additionalData) {
      Object.assign(patient, additionalData);
    }

    this.recalculateAllQueuesAndMetrics();
    return patient;
  }

  public addPrescription(patientId: string, item: Omit<PrescriptionItem, 'id'>): Patient | null {
    const patient = this.patients.find(p => p.id === patientId || p.tokenNumber === patientId);
    if (!patient) return null;
    if (!patient.prescriptions) patient.prescriptions = [];
    patient.prescriptions.push({ ...item, id: `rx-${Date.now()}` });
    return patient;
  }

  public addLabOrder(patientId: string, item: Omit<LabOrderItem, 'id' | 'status' | 'orderedAt'>): Patient | null {
    const patient = this.patients.find(p => p.id === patientId || p.tokenNumber === patientId);
    if (!patient) return null;
    if (!patient.labOrders) patient.labOrders = [];
    patient.labOrders.push({
      ...item,
      id: `lab-${Date.now()}`,
      status: 'ORDERED',
      orderedAt: new Date().toISOString()
    });
    return patient;
  }

  // --- Beds Admin & Resources API ---
  public getBeds(): Bed[] {
    return this.beds;
  }

  public addBed(bedData: { bedNumber: string; ward: string; type: BedType; oxygenSupported: boolean; ventilatorAttached: boolean }): Bed {
    const newBed: Bed = {
      id: `bed-${Date.now()}`,
      bedNumber: bedData.bedNumber,
      ward: bedData.ward,
      type: bedData.type,
      status: 'AVAILABLE',
      oxygenSupported: !!bedData.oxygenSupported,
      ventilatorAttached: !!bedData.ventilatorAttached,
    };
    this.beds.push(newBed);
    this.addAuditLog('ADD_BED', `Added new bed ${newBed.bedNumber} in ${newBed.ward} (${newBed.type})`, 'BED');
    return newBed;
  }

  public deleteBed(bedId: string): boolean {
    const idx = this.beds.findIndex(b => b.id === bedId);
    if (idx === -1) return false;
    const removed = this.beds.splice(idx, 1)[0];
    this.addAuditLog('DELETE_BED', `Decommissioned bed ${removed.bedNumber} from ${removed.ward}`, 'BED');
    return true;
  }

  public updateBedStatus(bedId: string, status: BedStatus, patientName?: string): Bed | null {
    const bed = this.beds.find(b => b.id === bedId);
    if (!bed) return null;
    bed.status = status;
    if (status === 'OCCUPIED' && patientName) {
      bed.patientName = patientName;
      bed.admittedAt = new Date().toISOString();
    } else if (status === 'AVAILABLE' || status === 'CLEANING') {
      bed.patientId = undefined;
      bed.patientName = undefined;
    }
    this.addAuditLog('UPDATE_BED_STATUS', `Updated bed ${bed.bedNumber} status to ${status}`, 'BED');
    return bed;
  }

  // --- Doctors Admin & Resources API ---
  public getDoctors(): Doctor[] {
    return this.doctors;
  }

  public addDoctor(doctorData: { name: string; specialty: string; department: DepartmentType; chamberNumber: string; status?: Doctor['status'] }): Doctor {
    const newDoctor: Doctor = {
      id: `doc-${Date.now()}`,
      name: doctorData.name,
      specialty: doctorData.specialty,
      department: doctorData.department,
      chamberNumber: doctorData.chamberNumber,
      status: doctorData.status || 'AVAILABLE',
      patientsServedToday: 0,
      avgConsultationMinutes: 8,
      activeQueueCount: 0,
    };
    this.doctors.push(newDoctor);
    this.addAuditLog('ADD_DOCTOR', `Added doctor ${newDoctor.name} to ${newDoctor.department} (${newDoctor.chamberNumber})`, 'DOCTOR');
    return newDoctor;
  }

  public updateDoctor(doctorId: string, updates: Partial<Doctor>): Doctor | null {
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (!doctor) return null;
    Object.assign(doctor, updates);
    this.addAuditLog('UPDATE_DOCTOR', `Updated details for ${doctor.name} (${doctor.chamberNumber})`, 'DOCTOR');
    return doctor;
  }

  public deleteDoctor(doctorId: string): boolean {
    const idx = this.doctors.findIndex(d => d.id === doctorId);
    if (idx === -1) return false;
    const removed = this.doctors.splice(idx, 1)[0];
    this.addAuditLog('DELETE_DOCTOR', `Removed doctor ${removed.name} from active roster`, 'DOCTOR');
    return true;
  }

  public updateDoctorStatus(doctorId: string, status: Doctor['status']): Doctor | null {
    const doctor = this.doctors.find(d => d.id === doctorId);
    if (!doctor) return null;
    doctor.status = status;
    this.addAuditLog('UPDATE_DOCTOR_STATUS', `Changed status of ${doctor.name} to ${status}`, 'DOCTOR');
    return doctor;
  }

  // --- Department Metrics & Congestion ---
  public getDepartmentMetrics(): DepartmentMetrics[] {
    const depts: { type: DepartmentType; name: string }[] = [
      { type: 'EMERGENCY', name: 'Emergency & Trauma' },
      { type: 'CARDIOLOGY', name: 'Cardiology OPD' },
      { type: 'GENERAL_MEDICINE', name: 'General Medicine OPD' },
      { type: 'ORTHOPEDICS', name: 'Orthopedics OPD' },
      { type: 'PEDIATRICS', name: 'Pediatrics OPD' },
      { type: 'RADIOLOGY', name: 'Radiology & Imaging' },
      { type: 'PATHOLOGY', name: 'Pathology & Lab' },
      { type: 'ICU', name: 'Critical Care ICU' },
    ];

    return depts.map(d => {
      const capacity = this.departmentCapacities[d.type] || 15;
      const queueCount = this.patients.filter(p => 
        p.triage.assignedDepartment === d.type && 
        (p.stage === 'WAITING_OPD' || p.stage === 'TRIAGE' || p.stage === 'DIAGNOSTICS')
      ).length;

      const activeDocs = this.doctors.filter(doc => doc.department === d.type && doc.status !== 'OFF_DUTY').length || 1;
      const congestionPercent = Math.min(100, Math.round((queueCount / capacity) * 100));
      const avgWait = Math.round((queueCount * 7) / activeDocs);

      let congestionLevel: DepartmentMetrics['congestionLevel'] = 'LOW';
      if (congestionPercent >= 85) congestionLevel = 'CRITICAL';
      else if (congestionPercent >= 65) congestionLevel = 'HIGH';
      else if (congestionPercent >= 40) congestionLevel = 'MODERATE';
      else if (congestionPercent >= 20) congestionLevel = 'OPTIMAL';

      let statusDescription = 'Smooth patient flow';
      if (congestionLevel === 'CRITICAL') statusDescription = 'Severe bottleneck: AI resource shift required';
      else if (congestionLevel === 'HIGH') statusDescription = 'High queue load: Monitor doctor availability';
      else if (congestionLevel === 'MODERATE') statusDescription = 'Steady flow with moderate wait time';

      return {
        department: d.type,
        displayName: d.name,
        currentQueueLength: queueCount,
        activeDoctorsCount: activeDocs,
        avgWaitTimeMinutes: Math.max(5, avgWait),
        congestionPercent,
        congestionLevel,
        statusDescription,
        capacity,
      };
    });
  }

  public updateDepartmentCapacity(department: DepartmentType, newCapacity: number): DepartmentMetrics | null {
    if (newCapacity <= 0) return null;
    this.departmentCapacities[department] = newCapacity;
    this.addAuditLog('UPDATE_DEPT_CAPACITY', `Configured ${department} queue capacity to ${newCapacity}`, 'DEPARTMENT');
    this.recalculateAllQueuesAndMetrics();
    const metrics = this.getDepartmentMetrics().find(d => d.department === department);
    return metrics || null;
  }

  // --- Hospital Stats ---
  public getHospitalStats(): HospitalStats {
    const totalPatientsToday = this.patients.length + 35;
    const activeInHospital = this.patients.filter(p => p.stage !== 'DISCHARGED').length;
    const waitingInOPD = this.patients.filter(p => p.stage === 'WAITING_OPD').length;
    const inConsultation = this.patients.filter(p => p.stage === 'IN_CONSULTATION').length;
    const inDiagnostics = this.patients.filter(p => p.stage === 'DIAGNOSTICS').length;
    const currentlyAdmitted = this.beds.filter(b => b.status === 'OCCUPIED').length;
    const dischargedToday = 14;

    const totalBeds = this.beds.length;
    const occupiedBeds = this.beds.filter(b => b.status === 'OCCUPIED').length;
    const availableBeds = this.beds.filter(b => b.status === 'AVAILABLE').length;

    const icuBeds = this.beds.filter(b => b.type === 'ICU');
    const icuOccupied = icuBeds.filter(b => b.status === 'OCCUPIED').length;
    const icuOccupancyPercent = Math.round((icuOccupied / (icuBeds.length || 1)) * 100);
    const overallBedOccupancyPercent = Math.round((occupiedBeds / totalBeds) * 100);

    const waitTimes = this.getDepartmentMetrics().map(d => ({
      department: d.displayName.replace(' OPD', ''),
      waitTime: d.avgWaitTimeMinutes,
    }));

    const wardMap: { [key: string]: { occupied: number; total: number } } = {};
    for (const b of this.beds) {
      if (!wardMap[b.ward]) wardMap[b.ward] = { occupied: 0, total: 0 };
      wardMap[b.ward].total++;
      if (b.status === 'OCCUPIED') wardMap[b.ward].occupied++;
    }

    const bedOccupancyByWard = Object.keys(wardMap).map(w => ({
      ward: w,
      occupied: wardMap[w].occupied,
      total: wardMap[w].total,
      percent: Math.round((wardMap[w].occupied / wardMap[w].total) * 100),
    }));

    return {
      totalPatientsToday,
      activeInHospital,
      waitingInOPD,
      inConsultation,
      inDiagnostics,
      currentlyAdmitted,
      dischargedToday,
      totalBeds,
      occupiedBeds,
      availableBeds,
      icuOccupancyPercent,
      overallBedOccupancyPercent,
      avgWaitTimeMinutes: 16,
      avgLengthOfStayHours: 4.2,
      hourlyArrivals: [
        { hour: '08:00', arrivals: 12, departures: 3 },
        { hour: '09:00', arrivals: 28, departures: 7 },
        { hour: '10:00', arrivals: 45, departures: 15 },
        { hour: '11:00', arrivals: 52, departures: 24 },
        { hour: '12:00', arrivals: 38, departures: 32 },
        { hour: '13:00', arrivals: 22, departures: 18 },
        { hour: '14:00', arrivals: 31, departures: 22 },
        { hour: '15:00', arrivals: 26, departures: 19 },
      ],
      waitTimesByDept: waitTimes,
      bedOccupancyByWard,
    };
  }

  // --- Audit Logs & Broadcast Alerts ---
  public addAuditLog(action: string, details: string, category: AdminAuditLog['category'] = 'AI', performedBy = 'Hospital Admin') {
    const entry: AdminAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      action,
      category,
      details,
      performedBy,
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 50) this.auditLogs.pop();
  }

  public getAuditLogs(): AdminAuditLog[] {
    return this.auditLogs;
  }

  public broadcastAlert(alert: Omit<HospitalBroadcastAlert, 'id' | 'timestamp' | 'active'>): HospitalBroadcastAlert {
    const newBroadcast: HospitalBroadcastAlert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      code: alert.code,
      title: alert.title,
      message: alert.message,
      targetWards: alert.targetWards,
      active: true,
    };
    this.activeBroadcasts.unshift(newBroadcast);
    this.addAuditLog('BROADCAST_ALERT', `Issued ${alert.code}: ${alert.title} - ${alert.message}`, 'BROADCAST');
    return newBroadcast;
  }

  public getBroadcasts(): HospitalBroadcastAlert[] {
    return this.activeBroadcasts;
  }

  // --- AI Recommendations ---
  public getRecommendations(): AIResourceRecommendation[] {
    return this.recommendations;
  }

  public executeRecommendation(id: string): AIResourceRecommendation | null {
    const rec = this.recommendations.find(r => r.id === id);
    if (!rec) return null;
    rec.isExecuted = true;

    // Apply effect based on recommendation
    if (rec.actionPayload?.type === 'OPEN_SURGE_CHAMBER' && rec.actionPayload.doctorId) {
      const doc = this.doctors.find(d => d.id === rec.actionPayload?.doctorId);
      if (doc) doc.status = 'AVAILABLE';
    } else if (rec.actionPayload?.type === 'FAST_TRACK_DISCHARGE' && rec.actionPayload.bedIds) {
      for (const bedId of rec.actionPayload.bedIds) {
        const bed = this.beds.find(b => b.id === bedId);
        if (bed) {
          bed.status = 'AVAILABLE';
          bed.patientName = undefined;
          bed.patientId = undefined;
        }
      }
    }

    this.addAuditLog('EXECUTE_AI_RECOMMENDATION', `Executed AI Recommendation: ${rec.title}`, 'AI');
    this.recalculateAllQueuesAndMetrics();
    return rec;
  }

  // --- Simulation Triggers ---
  public triggerSimulation(scenario: 'MASS_CASUALTY' | 'FESTIVAL_SURGE' | 'RAPID_TURNOVER' | 'AI_AUTO_BALANCE'): { message: string; affectedCount: number } {
    if (scenario === 'MASS_CASUALTY') {
      const traumaPatients: Partial<Patient>[] = [
        { name: 'Casualty Alpha (M/32)', vitals: { heartRate: 135, bloodPressureSystolic: 80, bloodPressureDiastolic: 50, oxygenSaturation: 88, temperature: 97.4, respiratoryRate: 30, painLevel: 10 }, triage: { urgency: 'EMERGENCY', urgencyColor: 'red', news2Score: 10, priorityScore: 99, assignedDepartment: 'EMERGENCY', recommendedChamber: 'ER Bay 1', estimatedWaitMinutes: 0, chiefComplaint: 'Multiple blunt trauma, chest wall deformity', symptoms: ['Dyspnea', 'Shock', 'Trauma'], redFlagWarnings: ['Severe Shock', 'SpO2 88%'], aiClinicalSummary: 'Critical trauma with tension pneumothorax suspicion', admissionRiskPercent: 98, recommendedDiagnostics: ['eFAST', 'Chest Drain', 'CT Trauma'] } },
        { name: 'Casualty Beta (F/28)', vitals: { heartRate: 120, bloodPressureSystolic: 90, bloodPressureDiastolic: 60, oxygenSaturation: 91, temperature: 98.2, respiratoryRate: 26, painLevel: 9 }, triage: { urgency: 'EMERGENCY', urgencyColor: 'red', news2Score: 8, priorityScore: 95, assignedDepartment: 'EMERGENCY', recommendedChamber: 'ER Bay 2', estimatedWaitMinutes: 0, chiefComplaint: 'Compound femur fracture, active bleeding', symptoms: ['Severe Hemorrhage', 'Bone deformity'], redFlagWarnings: ['Active Arterial Bleed'], aiClinicalSummary: 'Open fracture with hypovolemia risk', admissionRiskPercent: 92, recommendedDiagnostics: ['X-Ray Femur', 'Crossmatch 2 units'] } },
        { name: 'Casualty Gamma (M/45)', vitals: { heartRate: 110, bloodPressureSystolic: 100, bloodPressureDiastolic: 68, oxygenSaturation: 93, temperature: 98.6, respiratoryRate: 22, painLevel: 8 }, triage: { urgency: 'URGENT', urgencyColor: 'amber', news2Score: 5, priorityScore: 82, assignedDepartment: 'ORTHOPEDICS', recommendedChamber: 'Chamber 301', estimatedWaitMinutes: 5, chiefComplaint: 'Pelvic contusion and abdominal tenderness', symptoms: ['Abdominal pain', 'Inability to bear weight'], redFlagWarnings: ['Pelvic stability check required'], aiClinicalSummary: 'Moderate trauma with possible retroperitoneal hematoma', admissionRiskPercent: 70, recommendedDiagnostics: ['Pelvis X-Ray', 'Abdomen Ultrasound'] } },
        { name: 'Casualty Delta (M/22)', vitals: { heartRate: 105, bloodPressureSystolic: 115, bloodPressureDiastolic: 75, oxygenSaturation: 95, temperature: 98.4, respiratoryRate: 20, painLevel: 7 }, triage: { urgency: 'URGENT', urgencyColor: 'amber', news2Score: 4, priorityScore: 75, assignedDepartment: 'EMERGENCY', recommendedChamber: 'ER Triage Bay', estimatedWaitMinutes: 5, chiefComplaint: 'Deep facial lacerations, concussion with brief LOC', symptoms: ['Head injury', 'Laceration'], redFlagWarnings: ['Post-concussion monitoring'], aiClinicalSummary: 'Head trauma, GCS 14. CT Head indicated.', admissionRiskPercent: 65, recommendedDiagnostics: ['CT Brain', 'Wound Debridement'] } },
      ];

      for (const tp of traumaPatients) {
        this.tokenCounter++;
        this.patients.unshift({
          id: `pat-trauma-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          tokenNumber: `TV-ER-${this.tokenCounter}`,
          name: tp.name || 'Trauma Patient',
          age: 30,
          gender: 'MALE',
          phone: '+91 99999 88888',
          languagePreference: 'en',
          stage: 'IN_CONSULTATION',
          queuePosition: 1,
          vitals: tp.vitals!,
          triage: tp.triage!,
          assignedDoctorId: 'doc-8',
          assignedDoctorName: 'Dr. Meera Sengupta',
          arrivalTime: new Date().toISOString(),
        });
      }

      // Add emergency recommendation
      this.recommendations.unshift({
        id: `rec-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
        title: 'CODE YELLOW: Mass Casualty Surge Detected',
        description: '4 high-acuity trauma casualties arrived. Emergency beds at 92% capacity.',
        suggestedAction: 'Activate Emergency Overflow Protocol: Mobilize Dr. Tariq Khan & Dr. Deepa Nair to ER Bay.',
        sourceDepartment: 'EMERGENCY',
        actionPayload: {
          type: 'ACTIVATE_CODE_YELLOW',
          doctorId: 'doc-9',
          roomNumber: 'ER Bay 2'
        },
        isExecuted: false,
      });

      this.addAuditLog('SIMULATION_TRIGGERED', 'Simulated Mass Casualty Highway Incident (+4 Trauma Emergencies)', 'AI');
      this.recalculateAllQueuesAndMetrics();
      return { message: 'Mass casualty trauma surge injected into Emergency Department.', affectedCount: traumaPatients.length };
    }

    if (scenario === 'FESTIVAL_SURGE') {
      const names = ['Kishore Kumar', 'Anita Roy', 'Ravi Teja', 'Sonia Gandhi', 'Vijay Sethi', 'Lakshmi Bai', 'Gautam Das', 'Manju Devi'];
      for (let i = 0; i < names.length; i++) {
        this.tokenCounter++;
        const isPed = i % 2 === 0;
        this.patients.push({
          id: `pat-fest-${Date.now()}-${i}`,
          tokenNumber: `TV-OPD-${this.tokenCounter}`,
          name: names[i],
          age: isPed ? 8 : 42,
          gender: i % 2 === 0 ? 'FEMALE' : 'MALE',
          phone: `+91 98765 0000${i}`,
          languagePreference: 'hi',
          stage: 'WAITING_OPD',
          queuePosition: i + 3,
          vitals: { heartRate: 85 + (i * 2), bloodPressureSystolic: 125, bloodPressureDiastolic: 80, oxygenSaturation: 98, temperature: 101.2, respiratoryRate: 18, painLevel: 4 },
          triage: {
            urgency: 'ROUTINE',
            urgencyColor: 'green',
            news2Score: 1,
            priorityScore: 35 + i,
            assignedDepartment: isPed ? 'PEDIATRICS' : 'GENERAL_MEDICINE',
            recommendedChamber: isPed ? 'Chamber 108' : 'Chamber 101',
            estimatedWaitMinutes: 15 + (i * 4),
            chiefComplaint: isPed ? 'Seasonal viral fever, dry cough' : 'Gastroenteritis, food poisoning post festival feast',
            symptoms: ['Fever', 'Cough', 'Vomiting'],
            redFlagWarnings: [],
            aiClinicalSummary: 'Seasonal viral presentation, hemodynamically stable.',
            admissionRiskPercent: 10,
            recommendedDiagnostics: ['CBC', 'Stool Routine'],
          },
          arrivalTime: new Date().toISOString(),
        });
      }

      this.recommendations.unshift({
        id: `rec-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity: 'WARNING',
        title: 'OPD Peak Influx Spike (Festival Outbreak)',
        description: 'Pediatrics and General Medicine queues exceeded 15 patients each.',
        suggestedAction: 'Open Fast-Track Surge Chamber 104 with Dr. Rajesh Sharma.',
        sourceDepartment: 'GENERAL_MEDICINE',
        targetDepartment: 'PEDIATRICS',
        actionPayload: {
          type: 'OPEN_SURGE_CHAMBER',
          doctorId: 'doc-1',
          roomNumber: 'Chamber 104'
        },
        isExecuted: false,
      });

      this.addAuditLog('SIMULATION_TRIGGERED', 'Simulated Festival Seasonal OPD Influx (+8 patients)', 'AI');
      this.recalculateAllQueuesAndMetrics();
      return { message: 'Festival seasonal surge added 8 active patients to General Medicine & Pediatrics.', affectedCount: names.length };
    }

    if (scenario === 'RAPID_TURNOVER') {
      let releasedCount = 0;
      for (const b of this.beds) {
        if (b.status === 'OCCUPIED' && (b.dischargeReadinessScore || 0) >= 60) {
          b.status = 'CLEANING';
          b.patientName = undefined;
          b.patientId = undefined;
          releasedCount++;
          setTimeout(() => {
            if (b.status === 'CLEANING') b.status = 'AVAILABLE';
          }, 5000);
        }
      }

      this.addAuditLog('SIMULATION_TRIGGERED', `Fast-Track Predictive Bed Turnover executed for ${releasedCount} eligible beds`, 'BED');
      this.recalculateAllQueuesAndMetrics();
      return { message: `AI Predictive Bed Release executed for ${releasedCount} eligible beds. Sent for instant sanitization.`, affectedCount: releasedCount };
    }

    if (scenario === 'AI_AUTO_BALANCE') {
      let executedCount = 0;
      for (const rec of this.recommendations) {
        if (!rec.isExecuted) {
          this.executeRecommendation(rec.id);
          executedCount++;
        }
      }
      this.addAuditLog('SIMULATION_TRIGGERED', `Autonomous AI Equilibrium resolved ${executedCount} bottlenecks`, 'AI');
      return { message: `AI Optimizer automatically resolved ${executedCount} active hospital congestion bottlenecks.`, affectedCount: executedCount };
    }

    return { message: 'Unknown scenario', affectedCount: 0 };
  }

  // --- Internal Triage & Calculation Engine ---
  private calculateTriageAssessment(vitals: Vitals, chiefComplaint: string, symptoms: string[]): TriageAssessment {
    let news2 = 0;
    const redFlags: string[] = [];

    // NEWS2 Score Calculation
    // Respiration Rate
    if (vitals.respiratoryRate <= 8 || vitals.respiratoryRate >= 25) news2 += 3;
    else if (vitals.respiratoryRate >= 21) news2 += 2;
    else if (vitals.respiratoryRate >= 9 && vitals.respiratoryRate <= 11) news2 += 1;

    // SpO2
    if (vitals.oxygenSaturation <= 91) {
      news2 += 3;
      redFlags.push('Critical Hypoxia (SpO2 <= 91%)');
    } else if (vitals.oxygenSaturation <= 93) {
      news2 += 2;
      redFlags.push('Moderate Hypoxia (SpO2 92-93%)');
    } else if (vitals.oxygenSaturation <= 95) {
      news2 += 1;
    }

    // Systolic BP
    if (vitals.bloodPressureSystolic <= 90) {
      news2 += 3;
      redFlags.push('Severe Hypotension (Systolic BP <= 90 mmHg)');
    } else if (vitals.bloodPressureSystolic <= 100) {
      news2 += 2;
    } else if (vitals.bloodPressureSystolic >= 180) {
      news2 += 2;
      redFlags.push('Hypertensive Crisis (Systolic BP >= 180 mmHg)');
    }

    // Heart Rate
    if (vitals.heartRate <= 40 || vitals.heartRate >= 131) {
      news2 += 3;
      redFlags.push('Critical Dysrhythmia (HR <= 40 or >= 131 bpm)');
    } else if (vitals.heartRate >= 111) {
      news2 += 2;
    } else if (vitals.heartRate >= 91) {
      news2 += 1;
    }

    // Temperature
    if (vitals.temperature <= 95.0 || vitals.temperature >= 102.5) news2 += 2;
    else if (vitals.temperature >= 100.4 || vitals.temperature <= 96.8) news2 += 1;

    // Pain Score
    if (vitals.painLevel >= 8) redFlags.push('Severe Acute Pain (Score >= 8/10)');

    // Symptom Red Flags
    const lowerComplaint = (chiefComplaint + ' ' + symptoms.join(' ')).toLowerCase();
    if (lowerComplaint.includes('chest pain') || lowerComplaint.includes('heart attack') || lowerComplaint.includes('angina')) {
      redFlags.push('Cardiac Symptom: Immediate ECG protocol');
    }
    if (lowerComplaint.includes('unconscious') || lowerComplaint.includes('seizure') || lowerComplaint.includes('stroke') || lowerComplaint.includes('paralysis')) {
      redFlags.push('Neurological Deficit: Code Stroke protocol');
    }
    if (lowerComplaint.includes('breathless') || lowerComplaint.includes('gasping') || lowerComplaint.includes('choking')) {
      redFlags.push('Severe Airway/Breathing Compromise');
    }

    // Determine Urgency Category
    let urgency: TriageUrgency = 'ROUTINE';
    let urgencyColor: TriageAssessment['urgencyColor'] = 'green';
    let priorityScore = 30;
    let waitMinutes = 20;
    let admissionRisk = 10;

    if (news2 >= 7 || redFlags.length >= 2 || lowerComplaint.includes('accident') || lowerComplaint.includes('unconscious')) {
      urgency = 'EMERGENCY';
      urgencyColor = 'red';
      priorityScore = 95;
      waitMinutes = 0;
      admissionRisk = 85;
    } else if (news2 >= 4 || redFlags.length >= 1 || vitals.painLevel >= 7) {
      urgency = 'URGENT';
      urgencyColor = 'amber';
      priorityScore = 70;
      waitMinutes = 10;
      admissionRisk = 45;
    } else if (symptoms.length <= 1 && vitals.painLevel <= 3 && news2 === 0) {
      urgency = 'FAST_TRACK';
      urgencyColor = 'blue';
      priorityScore = 20;
      waitMinutes = 12;
      admissionRisk = 5;
    }

    // Department routing
    let assignedDepartment: DepartmentType = 'GENERAL_MEDICINE';
    let recommendedChamber = 'Chamber 101';
    const recommendedDiagnostics: string[] = ['CBC'];

    if (urgency === 'EMERGENCY') {
      assignedDepartment = 'EMERGENCY';
      recommendedChamber = 'ER Trauma Bay 1';
      recommendedDiagnostics.push('Stat ECG', 'Chest X-Ray', 'ABG Analysis');
    } else if (lowerComplaint.includes('chest') || lowerComplaint.includes('heart') || lowerComplaint.includes('palpitation') || vitals.bloodPressureSystolic > 160) {
      assignedDepartment = 'CARDIOLOGY';
      recommendedChamber = 'Chamber 204';
      recommendedDiagnostics.push('12-Lead ECG', 'Troponin-I', 'Echocardiogram');
    } else if (lowerComplaint.includes('bone') || lowerComplaint.includes('fracture') || lowerComplaint.includes('joint') || lowerComplaint.includes('sprain') || lowerComplaint.includes('knee')) {
      assignedDepartment = 'ORTHOPEDICS';
      recommendedChamber = 'Chamber 301';
      recommendedDiagnostics.push('X-Ray Digital', 'Serum Uric Acid');
    } else if (lowerComplaint.includes('child') || lowerComplaint.includes('baby') || lowerComplaint.includes('pediatric') || (vitals.temperature > 101 && lowerComplaint.includes('vomit'))) {
      assignedDepartment = 'PEDIATRICS';
      recommendedChamber = 'Chamber 108';
      recommendedDiagnostics.push('Rapid Dengue/Malaria', 'Urine Routine');
    }

    const aiClinicalSummary = `AI Triage: Urgency ${urgency} (NEWS2 Score: ${news2}). Vitals: HR ${vitals.heartRate}, BP ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}, SpO2 ${vitals.oxygenSaturation}%, Temp ${vitals.temperature}°F. ${redFlags.length > 0 ? 'Flags: ' + redFlags.join(', ') : 'No critical hemodynamic red flags.'}`;

    return {
      urgency,
      urgencyColor,
      news2Score: news2,
      priorityScore,
      assignedDepartment,
      recommendedChamber,
      estimatedWaitMinutes: waitMinutes,
      chiefComplaint,
      symptoms,
      redFlagWarnings: redFlags,
      aiClinicalSummary,
      admissionRiskPercent: admissionRisk,
      recommendedDiagnostics,
    };
  }

  private recalculateAllQueuesAndMetrics() {
    // Re-index queue positions
    const depts: DepartmentType[] = ['EMERGENCY', 'CARDIOLOGY', 'GENERAL_MEDICINE', 'ORTHOPEDICS', 'PEDIATRICS', 'RADIOLOGY', 'PATHOLOGY', 'ICU'];
    for (const dept of depts) {
      const waiting = this.patients.filter(p => p.triage.assignedDepartment === dept && p.stage === 'WAITING_OPD');
      // Sort by priorityScore descending
      waiting.sort((a, b) => b.triage.priorityScore - a.triage.priorityScore);
      waiting.forEach((p, index) => {
        p.queuePosition = index + 1;
        p.triage.estimatedWaitMinutes = (index + 1) * 7;
      });
    }
  }
}

export const hospitalStore = new HospitalDataStore();
