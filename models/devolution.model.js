var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DevolutionSchema = new Schema({
  devolutionNumber: {
    type: String,
    required: true
  },
  devolutionDate: {
    type: Date,
    required: true
  },
  devolutionObservation: {
    type: String,
    required: false
  },
  devolutionWorkId: {
    type: Schema.Types.ObjectId,
    ref: 'Work',
    required: true
  },
  devolutionDetail: [{
    devolutionDetailId: Number,
    devolutionDetailProductId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    devolutionDetailQuantity: Number,
  }],
  devolutionLocalId: {
    type: Number,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("Devolution", DevolutionSchema);