var mongoose = require('mongoose');
var AccountSchema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  checkConfiguration: {
    type: Number,
    required: true
  }
});
var Account = mongoose.model('Account', AccountSchema);
module.exports = Account;


