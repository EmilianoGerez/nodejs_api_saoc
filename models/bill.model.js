var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
});

module.exports = mongoose.model("Bill", BillSchema);