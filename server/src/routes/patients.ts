import { Router } from 'express';
import { hospitalStore } from '../services/hospitalStore.js';
import { broadcastHospitalUpdate, notifyPatientUpdate } from '../services/socketHandler.js';

const router = Router();

// GET /api/patients
router.get('/', (req, res) => {
  const { department, stage, search } = req.query;
  let list = hospitalStore.getPatients();

  if (department) {
    list = list.filter(p => p.triage.assignedDepartment === department);
  }
  if (stage) {
    list = list.filter(p => p.stage === stage);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.tokenNumber.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  }

  res.json({ success: true, count: list.length, data: list });
});

// GET /api/patients/:idOrToken
router.get('/:idOrToken', (req, res) => {
  const patient = hospitalStore.getPatientById(req.params.idOrToken);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient token not found' });
  }
  res.json({ success: true, data: patient });
});

// POST /api/patients/checkin (Self Check-in & Triage)
router.post('/checkin', (req, res) => {
  try {
    const { name, age, gender, phone, abhaId, languagePreference, vitals, chiefComplaint, symptoms } = req.body;

    if (!name || !age || !phone || !vitals || !chiefComplaint) {
      return res.status(400).json({ success: false, error: 'Missing required patient check-in fields' });
    }

    const patient = hospitalStore.registerPatient({
      name,
      age: Number(age),
      gender: gender || 'OTHER',
      phone,
      abhaId,
      languagePreference: languagePreference || 'en',
      vitals,
      chiefComplaint,
      symptoms: symptoms || []
    });

    broadcastHospitalUpdate('patient:registered', patient);
    res.status(201).json({ success: true, message: 'Check-in successful', data: patient });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/patients/:id/stage (Stage transition)
router.patch('/:id/stage', (req, res) => {
  const { stage, assignedDoctorId, assignedDoctorName, clinicalNotes } = req.body;
  if (!stage) {
    return res.status(400).json({ success: false, error: 'Target stage is required' });
  }

  const patient = hospitalStore.updatePatientStage(req.params.id, stage, {
    assignedDoctorId,
    assignedDoctorName,
    clinicalNotes
  });

  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found' });
  }

  broadcastHospitalUpdate('patient:stage_updated', patient);
  notifyPatientUpdate(patient.tokenNumber, patient);
  res.json({ success: true, message: `Patient moved to ${stage}`, data: patient });
});

// POST /api/patients/:id/prescriptions
router.post('/:id/prescriptions', (req, res) => {
  const patient = hospitalStore.addPrescription(req.params.id, req.body);
  if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

  broadcastHospitalUpdate('patient:prescription_added', patient);
  notifyPatientUpdate(patient.tokenNumber, patient);
  res.json({ success: true, data: patient });
});

// POST /api/patients/:id/labs
router.post('/:id/labs', (req, res) => {
  const patient = hospitalStore.addLabOrder(req.params.id, req.body);
  if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

  broadcastHospitalUpdate('patient:lab_ordered', patient);
  notifyPatientUpdate(patient.tokenNumber, patient);
  res.json({ success: true, data: patient });
});

export default router;
