var mongoose = require('mongoose');

var SupplierSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: true
  },
  supplierCuit: {
    type: Number,
    required: false
  },
  supplierPhone: {
    type: String,
    required: false
  },
  supplierAddress: {
    type: String,
    required: true
  },
  supplierLocalId: {
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

module.exports = mongoose.model("Supplier", SupplierSchema);