const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

/**
 * Send email notification
 */
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Influencer Marketplace" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send application status update email
 */
const sendApplicationStatusEmail = async (to, campaignTitle, status) => {
    const statusMessages = {
        shortlisted: `Great news! You've been shortlisted for "${campaignTitle}"`,
        accepted: `Congratulations! You've been accepted for "${campaignTitle}"`,
        rejected: `Thank you for applying. Unfortunately, your application for "${campaignTitle}" was not selected.`,
    };

    return sendEmail({
        to,
        subject: `Application Update — ${campaignTitle}`,
        html: `<h2>${statusMessages[status] || `Your application for "${campaignTitle}" has been updated to: ${status}`}</h2>`,
        text: statusMessages[status] || `Application status: ${status}`,
    });
};

/**
 * Send payment notification email
 */
const sendPaymentEmail = async (to, amount, type) => {
    const subjects = {
        funded: 'Campaign Funded — Escrow Locked',
        released: 'Payment Released',
        disputed: 'Payment Dispute Opened',
    };

    return sendEmail({
        to,
        subject: subjects[type] || 'Payment Update',
        html: `<h2>Payment ${type}: ₹${amount}</h2>`,
        text: `Payment ${type}: ₹${amount}`,
    });
};

/**
 * Send deadline reminder email
 */
const sendDeadlineReminder = async (to, campaignTitle, daysLeft) => {
    return sendEmail({
        to,
        subject: `Deadline Reminder — ${campaignTitle}`,
        html: `<h2>Reminder: "${campaignTitle}" deadline is in ${daysLeft} day(s)</h2>`,
        text: `Reminder: "${campaignTitle}" deadline is in ${daysLeft} day(s)`,
    });
};

module.exports = {
    sendEmail,
    sendApplicationStatusEmail,
    sendPaymentEmail,
    sendDeadlineReminder,
};
