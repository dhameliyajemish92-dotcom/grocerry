import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text, html, attachments) => {
    try {
        console.log("Attempting to send email to:", email);
        console.log("Using EMAIL_USER:", process.env.EMAIL_USER);
        console.log(`>>> [EMAIL TRACE] Starting sendEmail to: ${email}`);
        console.log(`>>> [EMAIL TRACE] Using Config - User: ${process.env.EMAIL_USER}, Pass Length: ${process.env.EMAIL_PASS?.length || 0}`);

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            debug: true,
            logger: true
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
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
        console.log("Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw error;
    }
};

export default sendEmail;
