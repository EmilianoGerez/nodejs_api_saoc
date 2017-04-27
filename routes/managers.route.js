var express = require('express');
var router = express.Router();
var managerCtrl = require('../controllers/managers.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sync', managerCtrl.syncManagers);

module.exports = router;
