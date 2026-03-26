const Notification = require('../models/Notification');
const { getPagination, paginationMeta } = require('../utils/helpers');

const getNotifications = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const { type, unreadOnly } = req.query;
        const filter = { user: req.user._id };
        if (type) filter.type = type;
        if (unreadOnly === 'true') filter.isRead = false;
        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Notification.countDocuments(filter),
            Notification.countDocuments({ user: req.user._id, isRead: false }),
        ]);
        res.json({ success: true, data: { notifications, unreadCount }, pagination: paginationMeta(total, page, limit) });
    } catch (error) { next(error); }
};

const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, data: notification });
    } catch (error) { next(error); }
};

const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) { next(error); }
};

module.exports = { getNotifications, markAsRead, markAllRead };
