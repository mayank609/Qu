const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            default: '',
        },
        fileUrl: {
            type: String,
            default: '',
        },
        fileName: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            enum: ['text', 'file', 'image', 'system'],
            default: 'text',
        },
        readBy: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                readAt: { type: Date, default: Date.now },
            },
        ],
        isModerated: {
            type: Boolean,
            default: false,
        },
        moderationReason: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
