const express = require('express');
const router  = express.Router();
const routeController = require('../controllers/routeController');

// ── A* Route Engine (new primary endpoint) ───────────────────────────────────
// POST /api/route — runs A* for all 3 modes, returns routes + blackspots in one call
router.post('/route', routeController.computeAstarRoute);

// ── Legacy blackspot-only endpoint (kept for fallback) ───────────────────────
router.post('/compute-route', routeController.computeRoute);

// ── Global blackspot list ────────────────────────────────────────────────────
router.get('/blackspots', routeController.getBlackspots);

module.exports = router;
