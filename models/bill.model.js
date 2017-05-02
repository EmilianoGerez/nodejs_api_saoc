var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var BillSchema = new Schema({
  billNumber: {
    type: String,
    required: true
  },
  billDate: {
    type: Date,
    required: true
  },
  billSupplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  billDetail: [{
    billDetailId: Number,
    billDetailProductId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    billDetailQuantity: Number,
  }],
  billLocalId: {
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

BillSchema.virtual('billDateTimestamp').get(function () {
  return moment(this.billDate).unix();
});

module.exports = mongoose.model("Bill", BillSchema);