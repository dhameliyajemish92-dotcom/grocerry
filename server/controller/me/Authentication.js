import Users from "../../model/Users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../../utils/sendEmail.js";
import crypto from "crypto";

/* ========================= SIGNUP ========================= */
export const signup = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        const existingUser = await Users.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

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

        await sendEmail(email, "Email Verification", message);

        res
            .status(200)
            .json({ message: "User registered. Please verify your email." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
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
        console.error(err);
        res.status(500).json({ message: "Something went wrong" });
    }
};

/* ========================= LOGIN ========================= */
export const login = async (req, res) => {
    const { email, password } = req.body;

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
            process.env.JWT_SECRET_KEY || 'test',
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
                isVerified: user.isVerified, // info mate moklo
            },
            token,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Login failed" });
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
        res.status(500).json({ message: "Something went wrong" });
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
        res.status(400).json({ message: err.message });
    }
};
