var mongoose = require('mongoose');

var ManagerSchema = new mongoose.Schema({
  managerName: {
    type: String,
    required: true
  },
  managerPhone: {
    type: String,
    required: false
  },
  managerLocalId: {
    type: Number,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("Manager", ManagerSchema);