var express = require('express');
var router = express.Router();
var workCtrl = require('../controllers/works.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sync', workCtrl.syncWorks);

module.exports = router;
