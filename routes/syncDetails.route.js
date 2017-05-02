var express = require('express');
var router = express.Router();
var syncDetailCtrl = require('../controllers/syncDetails.controller');

router.post('/', syncDetailCtrl.updateSyncDetail);
router.get('/', syncDetailCtrl.getSyncDetail)

module.exports = router;
