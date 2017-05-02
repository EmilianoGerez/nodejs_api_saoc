var mongoose = require('mongoose');

var SyncDetailSchema = new mongoose.Schema({
  lastSyncDate: {
    type: Number,
    required: true
  },
  syncSuccessCount: {
    type: Number,
    required: true
  },
  syncFailCount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("SyncDetail", SyncDetailSchema);