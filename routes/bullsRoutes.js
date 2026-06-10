const express = require('express');
const router = express.Router();
const bullsController = require('../controllers/bullsController');

router.get('/', bullsController.getAllBulls);
router.post('/', bullsController.createBull);

module.exports = router;
