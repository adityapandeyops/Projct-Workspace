import { 
  Patient, 
  Bed, 
  Doctor, 
  DepartmentMetrics, 
  HospitalStats, 
  AIResourceRecommendation, 
  AdminAuditLog, 
  HospitalBroadcastAlert 
} from '../types';

const API_BASE = '/api';

export async function fetchPatients(params?: { department?: string; stage?: string; search?: string }): Promise<Patient[]> {
  const query = new URLSearchParams();
  if (params?.department) query.append('department', params.department);
  if (params?.stage) query.append('stage', params.stage);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE}/patients?${query.toString()}`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchPatientById(idOrToken: string): Promise<Patient | null> {
  const res = await fetch(`${API_BASE}/patients/${idOrToken}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

export async function checkinPatient(data: {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  abhaId?: string;
  languagePreference: 'en' | 'hi' | 'ta' | 'bn';
  vitals: any;
  chiefComplaint: string;
  symptoms: string[];
}): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to check in patient');
  return json.data;
}

export async function updatePatientStage(patientId: string, stage: string, additional?: any): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients/${patientId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage, ...additional }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update patient stage');
  return json.data;
}

export async function addPrescription(patientId: string, item: any): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients/${patientId}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  const json = await res.json();
  return json.data;
}

export async function addLabOrder(patientId: string, item: any): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients/${patientId}/labs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  const json = await res.json();
  return json.data;
}

export async function fetchBeds(): Promise<Bed[]> {
  const res = await fetch(`${API_BASE}/resources/beds`);
  const json = await res.json();
  return json.data || [];
}

export async function createBed(data: { bedNumber: string; ward: string; type: string; oxygenSupported: boolean; ventilatorAttached: boolean }): Promise<Bed> {
  const res = await fetch(`${API_BASE}/resources/beds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to add bed');
  return json.data;
}

export async function updateBedStatus(bedId: string, status: string, patientName?: string): Promise<Bed> {
  const res = await fetch(`${API_BASE}/resources/beds/${bedId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, patientName }),
  });
  const json = await res.json();
  return json.data;
}

export async function deleteBed(bedId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/resources/beds/${bedId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete bed');
}

export async function fetchDoctors(): Promise<Doctor[]> {
  const res = await fetch(`${API_BASE}/resources/doctors`);
  const json = await res.json();
  return json.data || [];
}

export async function createDoctor(data: { name: string; specialty: string; department: string; chamberNumber: string; status?: string }): Promise<Doctor> {
  const res = await fetch(`${API_BASE}/resources/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to add doctor');
  return json.data;
}

export async function updateDoctorDetails(doctorId: string, updates: Partial<Doctor>): Promise<Doctor> {
  const res = await fetch(`${API_BASE}/resources/doctors/${doctorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update doctor details');
  return json.data;
}

export async function deleteDoctor(doctorId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/resources/doctors/${doctorId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete doctor');
}

export async function updateDepartmentCapacity(department: string, capacity: number): Promise<DepartmentMetrics> {
  const res = await fetch(`${API_BASE}/resources/departments/${department}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capacity }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update department capacity');
  return json.data;
}

export async function fetchOverviewAnalytics(): Promise<{ stats: HospitalStats; departments: DepartmentMetrics[] }> {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  const json = await res.json();
  return json.data;
}

export async function fetchRecommendations(): Promise<AIResourceRecommendation[]> {
  const res = await fetch(`${API_BASE}/analytics/recommendations`);
  const json = await res.json();
  return json.data || [];
}

export async function executeRecommendation(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics/recommendations/${id}/execute`, {
    method: 'POST',
  });
  return res.json();
}

export async function fetchAuditLogs(): Promise<AdminAuditLog[]> {
  const res = await fetch(`${API_BASE}/resources/audit-logs`);
  const json = await res.json();
  return json.data || [];
}

export async function broadcastHospitalAlert(data: { code: string; title: string; message: string; targetWards?: string[] }): Promise<HospitalBroadcastAlert> {
  const res = await fetch(`${API_BASE}/resources/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to issue broadcast alert');
  return json.data;
}

export async function triggerSimulation(scenarioId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/simulation/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId }),
  });
  return res.json();
}

export async function requestAiTriagePreview(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/ai/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json.data;
}
