import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text, html, attachments) => {
    try {
        console.log(`>>> [EMAIL TRACE] Starting sendEmail to: ${email}`);
        console.log(`>>> [EMAIL TRACE] Config - User: ${process.env.EMAIL_USER}, Pass Length: ${process.env.EMAIL_PASS?.length || 0}`);

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false // Helps with cloud environment certificate issues
            },
            debug: true,
            logger: true
        });

        // Verify connection configuration
        console.log(">>> [EMAIL TRACE] Verifying transporter...");
        await transporter.verify();
        console.log(">>> [EMAIL TRACE] Transporter verified successfully.");

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

        console.log(">>> [EMAIL TRACE] Sending mail...");
        const info = await transporter.sendMail(mailOptions);
        console.log(">>> [EMAIL TRACE] Email sent successfully:", info.messageId);
        console.log(">>> [EMAIL TRACE] Response:", info.response);
        return info;
    } catch (error) {
        console.error(">>> [EMAIL TRACE] ERROR:", error.message);
        console.error(">>> [EMAIL TRACE] Stack:", error.stack);
        throw error;
    }
};

export default sendEmail;
