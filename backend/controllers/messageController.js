const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { getPagination, paginationMeta } = require('../utils/helpers');

// Spam keywords for auto-moderation
const SPAM_KEYWORDS = [
    'free money',
    'click here',
    'buy now',
    'limited offer',
    'act now',
    'whatsapp',
    'telegram group',
];

const isSpam = (content) => {
    const lower = content.toLowerCase();
    return SPAM_KEYWORDS.some((keyword) => lower.includes(keyword));
};

// @desc    Start or get existing conversation
// @route   POST /api/messages/conversation
const startConversation = async (req, res, next) => {
    try {
        const { participantId, campaignId } = req.body;

        if (participantId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot start conversation with yourself' });
        }

        // Check if conversation already exists between these users
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, participantId] },
            ...(campaignId && { campaign: campaignId }),
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, participantId],
                campaign: campaignId || null,
            });

            // If campaign exists, send a system message summarizing the context
            if (campaignId) {
                const Campaign = require('../models/Campaign');
                const campaign = await Campaign.findById(campaignId);
                if (campaign) {
                    await Message.create({
                        conversation: conversation._id,
                        sender: req.user._id, // System messages can be sent as the initiator
                        content: `[System] Conversation started for campaign: "${campaign.title}". Expected deliverables: ${campaign.platform}. Budget: ₹${campaign.budgetRange.min} - ₹${campaign.budgetRange.max}.`,
                        type: 'text',
                        isModerated: false,
                        readBy: [{ user: req.user._id }]
                    });
                }
            }
        }

        await conversation.populate('participants', 'name avatar role');

        res.json({
            success: true,
            data: conversation,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all conversations for user
// @route   GET /api/messages/conversations
const getConversations = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);

        const [conversations, total] = await Promise.all([
            Conversation.find({ participants: req.user._id })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('participants', 'name avatar role')
                .populate('campaign', 'title'),
            Conversation.countDocuments({ participants: req.user._id }),
        ]);

        res.json({
            success: true,
            data: conversations,
            pagination: paginationMeta(total, page, limit),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send message
// @route   POST /api/messages/:conversationId
const sendMessage = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { content, fileUrl, fileName, type } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        // Check if user is participant
        if (!conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not a participant in this conversation' });
        }

        // Check if locked
        if (conversation.isLocked) {
            return res.status(400).json({ success: false, message: 'This conversation has been locked after deal completion' });
        }

        // Auto-moderation
        const moderated = content ? isSpam(content) : false;

        const message = await Message.create({
            conversation: conversationId,
            sender: req.user._id,
            content: content || '',
            fileUrl: fileUrl || '',
            fileName: fileName || '',
            type: type || 'text',
            isModerated: moderated,
            moderationReason: moderated ? 'Spam detected' : '',
            readBy: [{ user: req.user._id }],
        });

        // Update conversation last message
        conversation.lastMessage = {
            content: moderated ? '[Message flagged]' : content || '[File]',
            sender: req.user._id,
            sentAt: new Date(),
        };

        // Increment unread for other participants
        conversation.participants.forEach((p) => {
            if (p.toString() !== req.user._id.toString()) {
                const current = conversation.unreadCount.get(p.toString()) || 0;
                conversation.unreadCount.set(p.toString(), current + 1);
            }
        });

        await conversation.save();

        // Populate sender for response
        await message.populate('sender', 'name avatar');

        // Notify other participants via Socket and DB
        const io = req.app.get('io');
        const otherParticipants = conversation.participants.filter(
            (p) => p.toString() !== req.user._id.toString()
        );

        for (const participant of otherParticipants) {
            const notification = await Notification.create({
                user: participant,
                type: 'message_received',
                title: 'New Message',
                message: `${req.user.name}: ${content?.substring(0, 50) || '[File shared]'}`,
                link: `/chat?id=${conversationId}`,
                channel: 'push',
            });

            // Emit real-time notification
            if (io) {
                io.to(`user_${participant}`).emit('notification', notification);
                // Also emit to the conversation room if user is in it
                io.to(`conv_${conversationId}`).emit('newMessage', message);
            }
        }

        res.status(201).json({
            success: true,
            data: message,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get messages in conversation
// @route   GET /api/messages/:conversationId
const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { page, limit, skip } = getPagination(req.query);

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        if (!conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // Reset unread count for this user
        conversation.unreadCount.set(req.user._id.toString(), 0);
        await conversation.save();

        const [messages, total] = await Promise.all([
            Message.find({ conversation: conversationId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('sender', 'name avatar'),
            Message.countDocuments({ conversation: conversationId }),
        ]);

        res.json({
            success: true,
            data: messages.reverse(),
            pagination: paginationMeta(total, page, limit),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    startConversation,
    getConversations,
    sendMessage,
    getMessages,
};
