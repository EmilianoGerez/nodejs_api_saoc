var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

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
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

DevolutionSchema.virtual('devolutionDateTimestamp').get(function () {
  return moment(this.devolutionDate).unix();
});


module.exports = mongoose.model("Devolution", DevolutionSchema);