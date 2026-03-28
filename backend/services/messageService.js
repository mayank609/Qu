const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

/**
 * Unified service for chat messaging logic
 */
const messageService = {
    /**
     * Check if a user is a participant in a conversation
     */
    isParticipant: (conversation, userId) => {
        if (!conversation || !conversation.participants) return false;
        return conversation.participants.some(p => p.toString() === userId.toString());
    },

    /**
     * Create a new message and update conversation status
     */
    createMessage: async (conversationId, senderId, data) => {
        const { content, type, fileUrl, fileName, isModerated, moderationReason } = data;
        
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error('Conversation not found');
        if (conversation.isLocked) throw new Error('Conversation is locked');
        
        // Use unified participant check
        if (!messageService.isParticipant(conversation, senderId)) {
            throw new Error('User is not a participant in this conversation');
        }

        const message = await Message.create({
            conversation: conversationId,
            sender: senderId,
            content: content || '',
            type: type || 'text',
            fileUrl: fileUrl || '',
            fileName: fileName || '',
            isModerated: isModerated || false,
            moderationReason: moderationReason || '',
            readBy: [{ user: senderId }],
        });

        // Update conversation last message & unread counts
        conversation.lastMessage = {
            content: (isModerated) ? '[Message flagged]' : (content || '[File shared]'),
            sender: senderId,
            sentAt: new Date(),
        };

        conversation.participants.forEach((p) => {
            if (p.toString() !== senderId.toString()) {
                const current = conversation.unreadCount.get(p.toString()) || 0;
                conversation.unreadCount.set(p.toString(), current + 1);
            }
        });

        await conversation.save();
        await message.populate('sender', 'name avatar role');
        
        return { message, conversation };
    },

    /**
     * Notify participants via push notifications
     */
    sendPushNotifications: async (conversation, message, senderName) => {
        const otherParticipants = conversation.participants.filter(
            p => p.toString() !== message.sender._id.toString()
        );

        for (const participantId of otherParticipants) {
            await Notification.create({
                user: participantId,
                type: 'message_received',
                title: 'New Message',
                message: `${senderName}: ${message.content?.substring(0, 50) || '[File shared]'}`,
                link: `/chat?id=${conversation._id}`,
                channel: 'push',
            });
        }
    }
};

module.exports = messageService;
