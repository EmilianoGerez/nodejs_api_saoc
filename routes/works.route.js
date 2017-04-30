var express = require('express');
var router = express.Router();
var workCtrl = require('../controllers/works.controller');

/* GET users listing. */
router.get('/', workCtrl.findAll);

router.get('/:id', workCtrl.findById);

router.get('/:id/products', workCtrl.getProductsByWork);

router.post('/sync', workCtrl.syncWorks);

router.get('/dateRange/:from/:to/products', workCtrl.findByDateRange);

module.exports = router;
