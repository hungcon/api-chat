var mongoose = require('mongoose');
const Schema = mongoose.Schema;
var UserInforSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
      type: String,
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String,
  },
  avatarURL: {
    type: String
  },
  friends: [
    { type: Schema.Types.ObjectId, 
      ref: 'Friends'
    }
  ]
});
var UserInfor = mongoose.model('UserInfor', UserInforSchema);
module.exports = UserInfor;


