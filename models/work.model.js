var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WorkSchema = new Schema({
  workName: {
    type: String,
    required: true
  },
  workManagerId: {
    type: Schema.Types.ObjectId,
    ref: 'Manager'
  },
  workAddress: {
    type: String,
    required: true
  },
  workLocalId: {
    type: Number,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("Work", WorkSchema);