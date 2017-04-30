var express = require('express');
var router = express.Router();
var supplierCtrl = require('../controllers/suppliers.controller');

/* GET users listing. */

router.post('/sync', supplierCtrl.syncSuppliers);

router.get('/', supplierCtrl.findAll);

router.get('/:id', supplierCtrl.findSupplierAndBills);

module.exports = router;
