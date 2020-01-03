var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MessageSchema = new mongoose.Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'UserInfor'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'UserInfor'
    },
    content: {
        type: String
    },
    time: {
        type: Date,
        default: Date.now
    }
});

var Message = mongoose.model('Message', MessageSchema);
module.exports = Message;