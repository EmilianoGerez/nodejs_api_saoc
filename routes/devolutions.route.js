var express = require('express');
var router = express.Router();
var devolutionCtrl = require('../controllers/devolutions.controller');

/* GET users listing. */

router.post('/sync', devolutionCtrl.syncDevolutions);

router.get('/:id', devolutionCtrl.findDevolutionById);

// router.get('/dateRange/:from/:to/products', devolutionCtrl.findByDateRange)

module.exports = router;
