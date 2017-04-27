var express = require('express');
var router = express.Router();
var productCtrl = require('../controllers/products.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/sync', productCtrl.syncProducts);

module.exports = router;
