var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  productStock: {
    type: Number,
    required: true
  },
  productType: {
    type: Number,
    required: true
  },
  productUnit: {
    type: Boolean,
    required: true
  },
  productLocalId: {
    type: Number,
    required: true,
    unique: true
  }
});

module.exports = mongoose.model("Product", ProductSchema);