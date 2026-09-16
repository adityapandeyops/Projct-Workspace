import { Router } from 'express';
import { hospitalStore } from '../services/hospitalStore.js';
import { broadcastHospitalUpdate } from '../services/socketHandler.js';

const router = Router();

// POST /api/simulation/trigger
router.post('/trigger', (req, res) => {
  const { scenarioId } = req.body;
  if (!scenarioId) {
    return res.status(400).json({ success: false, error: 'scenarioId is required' });
  }

  const result = hospitalStore.triggerSimulation(scenarioId);
  broadcastHospitalUpdate('simulation:triggered', { scenarioId, result });

  res.json({
    success: true,
    message: result.message,
    affectedCount: result.affectedCount,
    timestamp: new Date().toISOString()
  });
});

export default router;
