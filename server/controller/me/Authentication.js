import Users from "../../model/Users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../../utils/sendEmail.js";
import crypto from "crypto";

/* ========================= SIGNUP ========================= */
export const signup = async (req, res) => {
    console.log("POST /api/me/signup requested");
    try {
        const { first_name, last_name, email, password } = req.body;
        console.log("Signup data:", { first_name, last_name, email, password: '***' });

        // Validation logs
        console.log("Signup attempt for email:", email);

        if (!email || !password || !first_name || !last_name) {
            console.warn("Validation failed: Missing fields");
            return res.status(400).json({
                message: "All fields are required (first_name, last_name, email, password)"
            });
        }

        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            console.warn("Signup failed: User already exists:", email);
            return res.status(400).json({ message: "User already exists. Please try another email or login." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        await Users.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            isVerified: false,
        });

        const message = `
Your OTP for email verification is:

OTP: ${otp}

This OTP is valid for 5 minutes.
Do not share it with anyone.
`;

        try {
            await sendEmail(email, "Email Verification", message);
            console.log("Signup OTP email sent to:", email);
        } catch (emailErr) {
            console.error("Critical: Signup OTP email failed to send:", emailErr.message);
            // We still return 200 because the user IS created, but we need to know it failed.
            return res.status(200).json({
                message: "User registered, but verification email failed to send. Please contact support.",
                debug_email_error: emailErr.message
            });
        }

        res
            .status(200)
            .json({ message: "User registered. Please verify your email." });
    } catch (err) {
        console.error("CRITICAL SIGNUP ERROR:", err);
        res.status(500).json({
            message: "Internal Server Error during signup",
            error: err.message,
            stack: err.stack
        });
    }
};

/* ========================= VERIFY OTP ========================= */
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await Users.findOne({ email });

        if (!user)
            return res.status(404).json({ message: "User not found" });

        if (user.isVerified)
            return res.status(400).json({ message: "User already verified" });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1w' }
        );

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                first_name: user.first_name,
                isVerified: true,
            },
            token,
        });
    } catch (err) {
        console.error("OTP VERIFY ERROR:", err);
        res.status(500).json({ message: "OTP verification failed due to an internal error.", error: err.message });
    }
};

/* ========================= LOGIN ========================= */
export const login = async (req, res) => {
    console.log("POST /api/me/login requested");
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    if (!email)
        return res.status(400).json({ message: "Email address is required" });

    if (!password)
        return res.status(400).json({ message: "Password is required" });

    try {
        const user = await Users.findOne({ email });

        if (!user)
            return res.status(404).json({ message: "User not found" });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Wrong password" });

        // 🔥 IMPORTANT FIX:
        // Email verified check REMOVED
        // Login allowed even if isVerified = false

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_AUTH_TTL || "1h" }
        );

        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                first_name: user.first_name,
                phone: user.phone,
                address: user.address,
                role: user.role,
                wishlist: user.wishlist,
                isVerified: user.isVerified,
            },
            token,
        });
    } catch (e) {
        console.error("CRITICAL LOGIN ERROR:", e);
        return res.status(500).json({
            message: "Login failed due to an internal server error.",
            error: e.message
        });
    }
};


/* ========================= VERIFY USER ========================= */
export const verifyUser = async (req, res) => {
    try {
        const id = req.user.id;

        const user = await Users.findById(id).select("-password");

        if (!user)
            return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (err) {
        console.error("VERIFY USER ERROR:", err);
        res.status(500).json({ message: "User verification failed.", error: err.message });
    }
};

/* ========================= VERIFY ROLE ========================= */
export const verifyRole = async (req, res) => {
    try {
        const { id, role } = req.body;

        const user = await Users.findById(id).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found" });

        if (user.role !== role)
            return res.status(401).json({ message: "Unauthorized user" });

        res.status(200).json({ user });
    } catch (err) {
        console.error("VERIFY ROLE ERROR:", err);
        res.status(400).json({ message: "Role verification failed.", error: err.message });
    }
};

/* ========================= FORGOT PASSWORD ========================= */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await Users.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found with this email" });

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const message = `
You requested a password reset. 
Your OTP is: ${otp}

This OTP is valid for 10 minutes. 
If you did not request this, please ignore this email.
`;
        await sendEmail(email, "Password Reset OTP", message);

        res.status(200).json({ message: "Password reset OTP sent to your email." });
    } catch (err) {
        console.error("FORGOT PASSWORD ERROR:", err);
        res.status(500).json({ message: "Failed to send reset OTP.", error: err.message });
    }
};

/* ========================= RESET PASSWORD ========================= */
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP, and new password are required" });
        }

        const user = await Users.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully. You can now login with your new password." });
    } catch (err) {
        console.error("RESET PASSWORD ERROR:", err);
        res.status(500).json({ message: "Failed to reset password.", error: err.message });
    }
};
