var express = require('express');
var router = express.Router();
var productCtrl = require('../controllers/products.controller');

/* GET users listing. */
router.get('/', productCtrl.findAll);

router.post('/sync', productCtrl.syncProducts);

module.exports = router;
