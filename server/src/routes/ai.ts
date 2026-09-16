import { Router } from 'express';
import { geminiService } from '../services/geminiService.js';
import { hospitalStore } from '../services/hospitalStore.js';

const router = Router();

// POST /api/ai/triage (Assess incoming patient vitals and symptoms)
router.post('/triage', async (req, res) => {
  try {
    const { name, age, gender, vitals, chiefComplaint, symptoms } = req.body;
    if (!vitals || !chiefComplaint) {
      return res.status(400).json({ success: false, error: 'Missing vitals or chief complaint' });
    }

    const evaluation = await geminiService.evaluateTriage({
      name: name || 'Anonymous Patient',
      age: Number(age) || 35,
      gender: gender || 'OTHER',
      vitals,
      chiefComplaint,
      symptoms: symptoms || []
    });

    res.json({ success: true, data: evaluation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/clinical-summary (Generate AI clinical notes for doctor)
router.post('/clinical-summary', async (req, res) => {
  try {
    const { patientId } = req.body;
    const patient = hospitalStore.getPatientById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const summary = await geminiService.generateClinicalNotes(patient);
    res.json({ success: true, data: { summary } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
