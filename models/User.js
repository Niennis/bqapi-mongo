const mongoose = require('mongoose');

const userScheme = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: Map,
    of: Boolean,
    // se mapea llave a booleano
  },
});

module.exports = mongoose.model('User', userScheme);