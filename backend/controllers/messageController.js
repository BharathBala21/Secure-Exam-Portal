const Message = require('../models/Message');
const User = require('../models/User');
const { encryptAES, decryptAES } = require('../utils/security');
const { createAuditLog } = require('../utils/auditLogger');

/**
 * Send a message
 */
const sendMessage = async (req, res, next) => {
    try {
        const { receiverId, content, isBroadcast, signature } = req.body;

        if (isBroadcast && req.user.role !== 'Faculty' && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only faculty/admins can broadcast messages' });
        }

        // Encrypt message content before storage
        const encryptedContent = encryptAES(content);

        const message = await Message.create({
            sender: req.user._id,
            receiver: isBroadcast ? null : receiverId,
            isBroadcast: isBroadcast || false,
            content: encryptedContent,
            signature // Storing the RSA signature provided by frontend
        });

        await createAuditLog({
            action: isBroadcast ? 'Broadcast Sent' : 'Message Sent',
            user: req.user,
            details: `Secure message dispatched to ${isBroadcast ? 'All Students' : receiverId}. Signature preserved.`,
            ipAddress: req.ip
        });

        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
};

/**
 * Get messages for current user
 */
const getMessages = async (req, res, next) => {
    try {
        // Find messages where user is receiver, OR it is a broadcast, OR user is sender
        const messages = await Message.find({
            $or: [
                { receiver: req.user._id },
                { isBroadcast: true },
                { sender: req.user._id }
            ]
        })
            .populate('sender', 'name role email')
            .populate('receiver', 'name role email')
            .sort({ createdAt: -1 });

        // Decrypt messages before sending to client
        const decryptedMessages = messages.map(m => {
            const doc = m.toObject();
            try {
                doc.content = decryptAES(m.content);
            } catch (e) {
                doc.content = "[Ciphertext corrupted]";
            }
            return doc;
        });

        res.json(decryptedMessages);
    } catch (error) {
        next(error);
    }
};

/**
 * Get available recipients
 */
const getRecipients = async (req, res, next) => {
    try {
        let query = { isApproved: true, _id: { $ne: req.user._id } };

        // Students can only see other students and faculty
        // Admins/Faculty can see everyone

        const users = await User.find(query).select('name email role rollNumber');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getRecipients
};
