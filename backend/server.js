const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initializeSocket } = require('./socket/chat');
const ensureDbConnection = require('./middleware/dbMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB().catch(err => console.error('Initial DB connection failed:', err));

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Initialize Socket.IO handlers
initializeSocket(io);

// Make io accessible to routes
app.set('io', io);

// --- Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// --- Routes ---
app.use('/api/', ensureDbConnection);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/influencer', require('./routes/influencer'));
app.use('/api/brand', require('./routes/brand'));
app.use('/api/campaigns', require('./routes/campaign'));
app.use('/api/applications', require('./routes/application'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/escrow', require('./routes/escrow'));
app.use('/api/search', require('./routes/search'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Influencer Marketplace API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// --- Background Jobs ---
// Check for campaign deadlines every 24 hours
setInterval(async () => {
    try {
        const Campaign = require('./models/Campaign');
        const Notification = require('./models/Notification');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const upcoming = await Campaign.find({
            'timeline.endDate': {
                $gte: new Date(),
                $lte: tomorrow
            },
            status: 'active'
        });

        for (const campaign of upcoming) {
            await Notification.create({
                user: campaign.brand,
                type: 'deadline_reminder',
                title: 'Campaign Deadline Approaching',
                message: `Your campaign "${campaign.title}" is ending within 24 hours.`,
                link: `/campaigns/${campaign._id}`
            });
        }
    } catch (err) {
        console.error('Deadline reminder job failed:', err);
    }
}, 24 * 60 * 60 * 1000);

// --- Start Server ---
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`\n🚀 Server running on port ${PORT}`);
        console.log(`📡 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔗 Health: http://localhost:${PORT}/api/health\n`);
    });
}

module.exports = app;
