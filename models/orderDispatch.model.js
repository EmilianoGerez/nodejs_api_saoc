var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var OrderDispatchSchema = new Schema({
  orderNumber: {
    type: String,
    required: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  orderTransportId: {
    type: Schema.Types.ObjectId,
    ref: 'Transport',
    required: true
  },
  orderDriverId: {
    type: Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  orderWorkId: {
    type: Schema.Types.ObjectId,
    ref: 'Work',
    required: true
  },
  orderDetail: [{
    orderDetailId: Number,
    orderDetailProductId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    orderDetailQuantity: Number,
  }],
  orderLocalId: {
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

OrderDispatchSchema.virtual('orderDateTimestamp').get(function () {
  return moment(this.orderDate).unix();
});

module.exports = mongoose.model("OrderDispatch", OrderDispatchSchema);