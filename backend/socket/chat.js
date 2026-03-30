const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const messageService = require('../services/messageService');

const initializeSocket = (io) => {
    // Auth middleware for socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication required'));
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) return next(new Error('User not found'));
            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.user.name}`);
        // Join user's personal room for notifications
        socket.join(`user_${socket.user._id}`);

        // Join a conversation room
        socket.on('joinConversation', async (conversationId) => {
            const conv = await Conversation.findById(conversationId);
            if (!conv || !messageService.isParticipant(conv, socket.user._id)) return;
            socket.join(`conv_${conversationId}`);
        });

        // Typing indicator - REMOVED for minimal chat
        // Real-time message - API now handles creation

        // Mark messages as read
        socket.on('messageRead', async ({ conversationId }) => {
            try {
                await Message.updateMany(
                    { conversation: conversationId, 'readBy.user': { $ne: socket.user._id } },
                    { $push: { readBy: { user: socket.user._id } } }
                );
                const conv = await Conversation.findById(conversationId);
                if (conv) { conv.unreadCount.set(socket.user._id.toString(), 0); await conv.save(); }
                socket.to(`conv_${conversationId}`).emit('messagesRead', { userId: socket.user._id });
            } catch (err) { console.error('Read error:', err); }
        });

        socket.on('disconnect', () => { console.log(`🔌 User disconnected: ${socket.user.name}`); });
    });
};

module.exports = { initializeSocket };
