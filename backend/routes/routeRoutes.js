const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

// POST /api/compute-route
router.post('/compute-route', routeController.computeRoute);

// GET /api/blackspots
router.get('/blackspots', routeController.getBlackspots);

module.exports = router;
