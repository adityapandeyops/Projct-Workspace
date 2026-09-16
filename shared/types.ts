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
  heartRate: number; // bpm
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  oxygenSaturation: number; // % (SpO2)
  temperature: number; // °F
  respiratoryRate: number; // breaths/min
  painLevel: number; // 0-10
}

export interface TriageAssessment {
  urgency: TriageUrgency;
  urgencyColor: 'red' | 'amber' | 'green' | 'blue';
  news2Score: number;
  priorityScore: number; // 1-100 (higher = see faster)
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

export interface Patient {
  id: string;
  tokenNumber: string; // e.g. "TV-OPD-104"
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  abhaId?: string;
  nationalId?: string; // Aadhaar / ABHA
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
  dischargeReadinessScore?: number; // 0-100%
  clinicalNotes?: string;
  prescriptions?: PrescriptionItem[];
  labOrders?: LabOrderItem[];
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
  congestionPercent: number; // 0-100
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

export interface SimulationEvent {
  scenarioId: 'MASS_CASUALTY' | 'FESTIVAL_SURGE' | 'RAPID_TURNOVER' | 'AI_AUTO_BALANCE';
  name: string;
  description: string;
  timestamp: string;
  affectedCount: number;
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
