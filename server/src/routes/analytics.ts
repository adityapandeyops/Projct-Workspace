import { Router } from 'express';
import { hospitalStore } from '../services/hospitalStore.js';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', (req, res) => {
  const stats = hospitalStore.getHospitalStats();
  const departments = hospitalStore.getDepartmentMetrics();
  res.json({
    success: true,
    data: {
      stats,
      departments
    }
  });
});

// GET /api/analytics/congestion
router.get('/congestion', (req, res) => {
  const departments = hospitalStore.getDepartmentMetrics();
  const criticalCount = departments.filter(d => d.congestionLevel === 'CRITICAL' || d.congestionLevel === 'HIGH').length;
  res.json({
    success: true,
    data: {
      departments,
      criticalBottlenecks: criticalCount,
      timestamp: new Date().toISOString()
    }
  });
});

// GET /api/analytics/recommendations
router.get('/recommendations', (req, res) => {
  const recs = hospitalStore.getRecommendations();
  res.json({ success: true, count: recs.length, data: recs });
});

// POST /api/analytics/recommendations/:id/execute
router.post('/recommendations/:id/execute', (req, res) => {
  const rec = hospitalStore.executeRecommendation(req.params.id);
  if (!rec) return res.status(404).json({ success: false, error: 'Recommendation not found' });
  res.json({ success: true, message: 'AI Resource recommendation executed successfully', data: rec });
});

export default router;
