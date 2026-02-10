import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text, html, attachments) => {
    try {
        console.log("Attempting to send email to:", email);
        console.log("Using EMAIL_USER:", process.env.EMAIL_USER);
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
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
