var express = require('express');
var router = express.Router();
var driverCtrl = require('../controllers/drivers.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sync', driverCtrl.syncDrivers);

module.exports = router;
