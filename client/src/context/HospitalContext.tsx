import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
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
import * as api from '../services/api';
import { playQueueChime, playEmergencyAlertSound } from '../utils/soundAlerts';

interface HospitalContextType {
  patients: Patient[];
  beds: Bed[];
  doctors: Doctor[];
  departments: DepartmentMetrics[];
  stats: HospitalStats | null;
  recommendations: AIResourceRecommendation[];
  auditLogs: AdminAuditLog[];
  activeBroadcasts: HospitalBroadcastAlert[];
  activePatientToken: string | null;
  activePatient: Patient | null;
  setActivePatientToken: (token: string | null) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  isConnected: boolean;
  refreshAll: () => Promise<void>;
  checkinPatient: (data: any) => Promise<Patient>;
  updatePatientStage: (id: string, stage: string, additional?: any) => Promise<Patient>;
  executeRecommendation: (id: string) => Promise<void>;
  triggerSimulation: (scenarioId: string) => Promise<any>;
  updateBedStatus: (bedId: string, status: string, name?: string) => Promise<void>;
  createBed: (data: { bedNumber: string; ward: string; type: string; oxygenSupported: boolean; ventilatorAttached: boolean }) => Promise<Bed>;
  deleteBed: (bedId: string) => Promise<void>;
  createDoctor: (data: { name: string; specialty: string; department: string; chamberNumber: string; status?: string }) => Promise<Doctor>;
  updateDoctorDetails: (doctorId: string, updates: Partial<Doctor>) => Promise<Doctor>;
  deleteDoctor: (doctorId: string) => Promise<void>;
  updateDepartmentCapacity: (dept: string, capacity: number) => Promise<void>;
  broadcastAlert: (data: { code: string; title: string; message: string; targetWards?: string[] }) => Promise<void>;
  addPrescription: (patientId: string, item: any) => Promise<void>;
  addLabOrder: (patientId: string, item: any) => Promise<void>;
  criticalAlertCount: number;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<DepartmentMetrics[]>([]);
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [recommendations, setRecommendations] = useState<AIResourceRecommendation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [activeBroadcasts, setActiveBroadcasts] = useState<HospitalBroadcastAlert[]>([]);
  const [activePatientToken, setActivePatientToken] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const activePatient = patients.find(p => p.tokenNumber === activePatientToken || p.id === activePatientToken) || null;

  const criticalAlertCount = recommendations.filter(r => !r.isExecuted && r.severity === 'CRITICAL').length +
    departments.filter(d => d.congestionLevel === 'CRITICAL').length;

  const refreshAll = async () => {
    try {
      const [pat, b, doc, analytics, recs, logs] = await Promise.all([
        api.fetchPatients(),
        api.fetchBeds(),
        api.fetchDoctors(),
        api.fetchOverviewAnalytics(),
        api.fetchRecommendations(),
        api.fetchAuditLogs()
      ]);
      setPatients(pat);
      setBeds(b);
      setDoctors(doc);
      if (analytics) {
        setStats(analytics.stats);
        setDepartments(analytics.departments);
      }
      setRecommendations(recs);
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Error fetching hospital state:', e);
    }
  };

  useEffect(() => {
    // Initial fetch
    refreshAll();

    // Setup WebSocket
    const socket: Socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('state:sync', (data: any) => {
      if (data.patients) setPatients(data.patients);
      if (data.beds) setBeds(data.beds);
      if (data.doctors) setDoctors(data.doctors);
      if (data.departments) setDepartments(data.departments);
      if (data.stats) setStats(data.stats);
      if (data.recommendations) setRecommendations(data.recommendations);
    });

    socket.on('patient:registered', (newPatient: Patient) => {
      if (soundEnabled) {
        if (newPatient.triage.urgency === 'EMERGENCY') playEmergencyAlertSound();
        else playQueueChime();
      }
      refreshAll();
    });

    socket.on('patient:stage_updated', () => {
      if (soundEnabled) playQueueChime();
      refreshAll();
    });

    socket.on('hospital:broadcast', (alert: HospitalBroadcastAlert) => {
      setActiveBroadcasts(prev => [alert, ...prev]);
      if (soundEnabled) playEmergencyAlertSound();
      refreshAll();
    });

    socket.on('simulation:triggered', (evt: any) => {
      if (soundEnabled) {
        if (evt?.scenarioId === 'MASS_CASUALTY') playEmergencyAlertSound();
        else playQueueChime();
      }
      refreshAll();
    });

    return () => {
      socket.disconnect();
    };
  }, [soundEnabled]);

  const handleCheckin = async (data: any) => {
    const patient = await api.checkinPatient(data);
    setActivePatientToken(patient.tokenNumber);
    await refreshAll();
    return patient;
  };

  const handleUpdateStage = async (id: string, stage: string, additional?: any) => {
    const updated = await api.updatePatientStage(id, stage, additional);
    await refreshAll();
    return updated;
  };

  const handleExecuteRecommendation = async (id: string) => {
    await api.executeRecommendation(id);
    await refreshAll();
  };

  const handleTriggerSimulation = async (scenarioId: string) => {
    const res = await api.triggerSimulation(scenarioId);
    await refreshAll();
    return res;
  };

  const handleUpdateBedStatus = async (bedId: string, status: string, name?: string) => {
    await api.updateBedStatus(bedId, status, name);
    await refreshAll();
  };

  const handleCreateBed = async (data: any) => {
    const bed = await api.createBed(data);
    await refreshAll();
    return bed;
  };

  const handleDeleteBed = async (bedId: string) => {
    await api.deleteBed(bedId);
    await refreshAll();
  };

  const handleCreateDoctor = async (data: any) => {
    const doc = await api.createDoctor(data);
    await refreshAll();
    return doc;
  };

  const handleUpdateDoctorDetails = async (doctorId: string, updates: Partial<Doctor>) => {
    const doc = await api.updateDoctorDetails(doctorId, updates);
    await refreshAll();
    return doc;
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    await api.deleteDoctor(doctorId);
    await refreshAll();
  };

  const handleUpdateDeptCapacity = async (dept: string, capacity: number) => {
    await api.updateDepartmentCapacity(dept, capacity);
    await refreshAll();
  };

  const handleBroadcastAlert = async (data: any) => {
    await api.broadcastHospitalAlert(data);
    await refreshAll();
  };

  const handleAddPrescription = async (patientId: string, item: any) => {
    await api.addPrescription(patientId, item);
    await refreshAll();
  };

  const handleAddLabOrder = async (patientId: string, item: any) => {
    await api.addLabOrder(patientId, item);
    await refreshAll();
  };

  return (
    <HospitalContext.Provider value={{
      patients,
      beds,
      doctors,
      departments,
      stats,
      recommendations,
      auditLogs,
      activeBroadcasts,
      activePatientToken,
      activePatient,
      setActivePatientToken,
      soundEnabled,
      setSoundEnabled,
      isConnected,
      refreshAll,
      checkinPatient: handleCheckin,
      updatePatientStage: handleUpdateStage,
      executeRecommendation: handleExecuteRecommendation,
      triggerSimulation: handleTriggerSimulation,
      updateBedStatus: handleUpdateBedStatus,
      createBed: handleCreateBed,
      deleteBed: handleDeleteBed,
      createDoctor: handleCreateDoctor,
      updateDoctorDetails: handleUpdateDoctorDetails,
      deleteDoctor: handleDeleteDoctor,
      updateDepartmentCapacity: handleUpdateDeptCapacity,
      broadcastAlert: handleBroadcastAlert,
      addPrescription: handleAddPrescription,
      addLabOrder: handleAddLabOrder,
      criticalAlertCount,
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) throw new Error('useHospital must be used within HospitalProvider');
  return context;
}
