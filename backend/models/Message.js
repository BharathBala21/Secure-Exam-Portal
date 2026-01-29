const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // null means broadcast or system message
    },
    isBroadcast: {
        type: Boolean,
        default: false
    },
    content: {
        type: String, // Will be AES encrypted
        required: true
    },
    signature: {
        type: String // RSA Signature to prove origin
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
