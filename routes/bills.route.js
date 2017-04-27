var express = require('express');
var router = express.Router();
var billCtrl = require('../controllers/bills.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sync', billCtrl.syncBills);

module.exports = router;
