var mongoose = require('mongoose');

var TransportSchema = new mongoose.Schema({
  transportName: {
    type: String,
    required: true
  },
  transportPlate: {
    type: String,
    required: true
  },
  transportLocalId: {
    type: Number,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("Transport", TransportSchema);