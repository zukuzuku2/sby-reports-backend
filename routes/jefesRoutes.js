const express = require('express');
const router = express.Router();
const jefesController = require('../controllers/jefesController');

router.get('/', jefesController.getAllJefes);

module.exports = router;
