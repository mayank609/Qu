const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            default: null,
        },
        isLocked: {
            type: Boolean,
            default: false,
        },
        lockedAt: {
            type: Date,
            default: null,
        },
        lastMessage: {
            content: String,
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            sentAt: { type: Date, default: Date.now },
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
