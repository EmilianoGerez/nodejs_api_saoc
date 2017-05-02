const mongoose = require('mongoose');
const SyncDetail = mongoose.model("SyncDetail");
const moment = require('moment');


exports.updateSyncDetail = function (req, res) {
  SyncDetail.find()
    .then(details => {
      if (details.length > 0) {
        syncDetail = details[0];
        syncDetail.lastSyncDate = req.body.lastSyncDate;
        syncDetail.syncSuccessCount = req.body.syncSuccessCount;
        syncDetail.syncFailCount = req.body.syncFailCount;
        return syncDetail.save();
      }
      return createSyncDetail(req.body);
    })
    .then(syncDetail => {
      return res.status(200).send(syncDetail);
    })
    .catch(error => res.status(500).send(error));
};

function createSyncDetail(syncDetail) {
  var newSyncDetail = new SyncDetail(syncDetail);
  return newSyncDetail.save();
}

exports.getSyncDetail = function (req, res) {
  SyncDetail.find()
    .then(details => {
      if (details.length < 1) return res.status(404).send({
        message: "No se ha sincronizado"
      });

      return res.status(200).send(details[0]);
    })
    .catch(error => res.status(500).send(error));
}