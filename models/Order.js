const mongoose = require('mongoose');

const orderScheme = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  products: [{
    qty: {
      type: Number,
      required: true,
    },
    product: {
      type: Map,
      of: String,
      required: true,
    }
  }],
  status: {
    type: String,
    required: true,
    enum: ['pending', 'canceled', 'delivering', 'delivered']
  },
  dateEntry: {
    type: Date,
    required: true,
  },
  dateProcessed: {
    type: Date,
    required: false,
  }
});

module.exports = mongoose.model('Order', orderScheme);