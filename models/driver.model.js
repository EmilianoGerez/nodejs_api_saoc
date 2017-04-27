var mongoose = require('mongoose');

var DriverSchema = new mongoose.Schema({
  driverName: {
    type: String,
    required: true
  },
  driverPhone: {
    type: String,
    required: false
  },
  driverLocalId: {
    type: Number,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("Driver", DriverSchema);