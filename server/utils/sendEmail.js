import nodemailer from "nodemailer";

const sendEmail = async (email, subject, text, html, attachments) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: Boolean(process.env.EMAIL_SECURE) || false,
            auth: {
                user: process.env.EMAIL_USER || "your-email@gmail.com",
                pass: process.env.EMAIL_PASS || "your-app-password",
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || "your-email@gmail.com",
            to: email,
            subject: subject,
            text: text,
            html: html,
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.log("Email not sent");
        console.error(error);
        throw error;
    }
};

export default sendEmail;
