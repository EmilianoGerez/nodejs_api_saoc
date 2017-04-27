var express = require('express');
var router = express.Router();
var supplierCtrl = require('../controllers/suppliers.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sync', supplierCtrl.syncSuppliers);

module.exports = router;
