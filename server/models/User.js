const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  solanaWallet: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    required: true,
  },
  authType: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
    unique: true,
  },
});

module.exports = mongoose.model('User', userSchema);
