var express = require('express');
var router = express.Router();
var billCtrl = require('../controllers/bills.controller');

/* GET users listing. */

router.post('/sync', billCtrl.syncBills);

router.get('/:id', billCtrl.findBillById);

router.get('/dateRange/:from/:to/products', billCtrl.findByDateRange);

module.exports = router;
