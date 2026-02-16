import nodemailer from 'nodemailer';

// Simplified transporter for compatibility
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const verifyTransporter = async () => {
    try {
        console.log(">>> [EMAIL] Verifying connection...");
        await transporter.verify();
        console.log(">>> [EMAIL] Service is READY");
        return true;
    } catch (error) {
        console.error(">>> [EMAIL] Service FAILED:", error.message);
        return false;
    }
};

const sendEmail = async (email, subject, text, html, attachments) => {
    try {
        console.log(`>>> [EMAIL] Attempting to send to: ${email}`);

        const mailOptions = {
            from: `"Grocer App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
        };

        if (html) {
            mailOptions.html = html;
        }

        if (attachments && attachments.length > 0) {
            mailOptions.attachments = attachments;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`>>> [EMAIL] Success! MessageId: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`>>> [EMAIL] FAILED to send to ${email}:`, error.message);
        // We log the stack locally during development/debug
        if (process.env.NODE_ENV !== 'production') {
            console.error(error.stack);
        }
        throw error;
    }
};

export default sendEmail;
