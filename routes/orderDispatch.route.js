var express = require('express');
var router = express.Router();
var orderCtrl = require('../controllers/orders.controller');

/* GET users listing. */

router.post('/sync', orderCtrl.syncOrderDispatchs);

router.get('/:id', orderCtrl.findOrderDispatchById);

router.get('/dateRange/:from/:to/products', orderCtrl.findByDateRange)

module.exports = router;
