import { Router } from 'express';
import { hospitalStore, DepartmentType, BedType } from '../services/hospitalStore.js';
import { broadcastHospitalUpdate } from '../services/socketHandler.js';

const router = Router();

// ==========================================
// BEDS ADMIN & RESOURCE ROUTES
// ==========================================

// GET /api/resources/beds
router.get('/beds', (req, res) => {
  const { ward, type, status } = req.query;
  let beds = hospitalStore.getBeds();

  if (ward) beds = beds.filter(b => b.ward === ward);
  if (type) beds = beds.filter(b => b.type === type);
  if (status) beds = beds.filter(b => b.status === status);

  res.json({ success: true, count: beds.length, data: beds });
});

// POST /api/resources/beds (ADMIN: Create new bed)
router.post('/beds', (req, res) => {
  const { bedNumber, ward, type, oxygenSupported, ventilatorAttached } = req.body;
  if (!bedNumber || !ward || !type) {
    return res.status(400).json({ success: false, error: 'Missing required bed fields (bedNumber, ward, type)' });
  }

  const newBed = hospitalStore.addBed({
    bedNumber,
    ward,
    type: type as BedType,
    oxygenSupported: !!oxygenSupported,
    ventilatorAttached: !!ventilatorAttached,
  });

  broadcastHospitalUpdate('bed:created', newBed);
  res.status(201).json({ success: true, message: `Bed ${newBed.bedNumber} added successfully`, data: newBed });
});

// PATCH /api/resources/beds/:id (Update bed status / discharge / clean)
router.patch('/beds/:id', (req, res) => {
  const { status, patientName } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'Status is required' });

  const bed = hospitalStore.updateBedStatus(req.params.id, status, patientName);
  if (!bed) return res.status(404).json({ success: false, error: 'Bed not found' });

  broadcastHospitalUpdate('bed:updated', bed);
  res.json({ success: true, data: bed });
});

// DELETE /api/resources/beds/:id (ADMIN: Decommission bed)
router.delete('/beds/:id', (req, res) => {
  const success = hospitalStore.deleteBed(req.params.id);
  if (!success) return res.status(404).json({ success: false, error: 'Bed not found' });

  broadcastHospitalUpdate('bed:deleted', { id: req.params.id });
  res.json({ success: true, message: 'Bed decommissioned successfully' });
});

// ==========================================
// DOCTORS ADMIN & ROSTER ROUTES
// ==========================================

// GET /api/resources/doctors
router.get('/doctors', (req, res) => {
  const { department, status } = req.query;
  let doctors = hospitalStore.getDoctors();

  if (department) doctors = doctors.filter(d => d.department === department);
  if (status) doctors = doctors.filter(d => d.status === status);

  res.json({ success: true, count: doctors.length, data: doctors });
});

// POST /api/resources/doctors (ADMIN: Add doctor to roster)
router.post('/doctors', (req, res) => {
  const { name, specialty, department, chamberNumber, status } = req.body;
  if (!name || !specialty || !department || !chamberNumber) {
    return res.status(400).json({ success: false, error: 'Missing required doctor fields' });
  }

  const newDoc = hospitalStore.addDoctor({
    name,
    specialty,
    department: department as DepartmentType,
    chamberNumber,
    status: status || 'AVAILABLE',
  });

  broadcastHospitalUpdate('doctor:created', newDoc);
  res.status(201).json({ success: true, message: `Doctor ${newDoc.name} registered on roster`, data: newDoc });
});

// PUT /api/resources/doctors/:id (ADMIN: Update doctor profile/chamber)
router.put('/doctors/:id', (req, res) => {
  const updated = hospitalStore.updateDoctor(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Doctor not found' });

  broadcastHospitalUpdate('doctor:updated', updated);
  res.json({ success: true, message: 'Doctor profile updated', data: updated });
});

// PATCH /api/resources/doctors/:id (Change doctor status)
router.patch('/doctors/:id', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'Status is required' });

  const doctor = hospitalStore.updateDoctorStatus(req.params.id, status);
  if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });

  broadcastHospitalUpdate('doctor:updated', doctor);
  res.json({ success: true, data: doctor });
});

// DELETE /api/resources/doctors/:id (ADMIN: Remove doctor from roster)
router.delete('/doctors/:id', (req, res) => {
  const success = hospitalStore.deleteDoctor(req.params.id);
  if (!success) return res.status(404).json({ success: false, error: 'Doctor not found' });

  broadcastHospitalUpdate('doctor:deleted', { id: req.params.id });
  res.json({ success: true, message: 'Doctor removed from roster' });
});

// ==========================================
// DEPARTMENTS & CAPACITIES ADMIN ROUTES
// ==========================================

// GET /api/resources/departments
router.get('/departments', (req, res) => {
  const depts = hospitalStore.getDepartmentMetrics();
  res.json({ success: true, data: depts });
});

// PATCH /api/resources/departments/:department (ADMIN: Update queue capacity limit)
router.patch('/departments/:department', (req, res) => {
  const { capacity } = req.body;
  if (!capacity || Number(capacity) <= 0) {
    return res.status(400).json({ success: false, error: 'Valid positive capacity is required' });
  }

  const updated = hospitalStore.updateDepartmentCapacity(req.params.department as DepartmentType, Number(capacity));
  if (!updated) return res.status(404).json({ success: false, error: 'Department not found' });

  broadcastHospitalUpdate('department:updated', updated);
  res.json({ success: true, message: `Capacity updated for ${req.params.department}`, data: updated });
});

// ==========================================
// AUDIT LOGS & BROADCAST ALERTS
// ==========================================

// GET /api/resources/audit-logs (ADMIN: System Audit Trail)
router.get('/audit-logs', (req, res) => {
  const logs = hospitalStore.getAuditLogs();
  res.json({ success: true, count: logs.length, data: logs });
});

// POST /api/resources/broadcast (ADMIN: Emergency announcement / Code Red / Code Blue)
router.post('/broadcast', (req, res) => {
  const { code, title, message, targetWards } = req.body;
  if (!code || !title || !message) {
    return res.status(400).json({ success: false, error: 'Missing required broadcast fields' });
  }

  const alert = hospitalStore.broadcastAlert({
    code,
    title,
    message,
    targetWards: targetWards || ['ALL'],
  });

  broadcastHospitalUpdate('hospital:broadcast', alert);
  res.status(201).json({ success: true, message: 'Emergency broadcast issued to all hospital stations', data: alert });
});

// GET /api/resources/broadcasts
router.get('/broadcasts', (req, res) => {
  const alerts = hospitalStore.getBroadcasts();
  res.json({ success: true, count: alerts.length, data: alerts });
});

export default router;
