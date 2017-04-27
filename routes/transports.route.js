var express = require('express');
var router = express.Router();
var transportCtrl = require('../controllers/transports.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sync', transportCtrl.syncTransports);

module.exports = router;
