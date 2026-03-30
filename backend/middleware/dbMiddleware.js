const connectDB = require('../config/db');

/**
 * Middleware to ensure the database is connected before processing the request.
 * This is crucial for serverless environments to prevent "buffering timed out" errors.
 */
const ensureDbConnection = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection middleware failed:', error.message);
        res.status(503).json({
            success: false,
            message: 'Database connection failed. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = ensureDbConnection;
