import Users from "../../model/Users.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import sendEmail from "../../utils/sendEmail.js";
import crypto from 'crypto';

export const signup = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        const existingUser = await Users.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        const user = await Users.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            isVerified: false
        });

        const message = `Your OTP for verification is ${otp}. It expires in 10 minutes.`;
        await sendEmail(email, "Email Verification", message);

        res.status(200).json({ message: "User registered. Please check your email for OTP verification." });
    } catch (e) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(e);
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await Users.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isVerified) return res.status(400).json({ message: "User already verified" });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({
            id: user._id,
            email: user.email
        }, process.env.JWT_SECRET_KEY || 'test', { expiresIn: '1h' }); // Fallback secret for safety

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                first_name: user.first_name,
                isVerified: user.isVerified
            },
            token
        });

    } catch (e) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(e);
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email)
        return res.status(400).json({ message: "Email address is not provided" })
    if (!password)
        return res.status(400).json({ message: "Password address is not provided" })

    try {
        const user = await Users.findOne({ email });

        if (!user)
            return res.status(404).json({ message: "User was not found" })

        if (!user.isVerified) {
            return res.status(400).json({ message: "Please verify your email first." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Wrong password" })

        const token = jwt.sign({
            id: user._id,
            email: user.email
        }, process.env.JWT_SECRET_KEY || 'test', { expiresIn: process.env.JWT_AUTH_TTL || '1h' });
        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                first_name: user.first_name,
                phone: user.phone,
                address: user.address,
                role: user.role,
                wishlist: user.wishlist,
                isVerified: user.isVerified
            },
            token
        });
    } catch (e) {
        return res.status(400).json({ message: e.message });
    }
}

export const verifyUser = async (req, res) => {
    const { id } = req.body;
    try {
        const user = await Users.findById(id, { password: 0 })
        return res.status(200).json({ ...user?._doc });
    } catch (e) {
        return res.status(404).json({ message: "User not found" });
    }
}

export const verifyRole = async (req, res) => {
    try {
        const { id, role } = req.body;

        const user = await Users.findById(id, { password: 0 });

        if (!user)
            return res.status(404).json({ message: `User ${id} was not found` });

        if (role !== user.role)
            return res.status(401).json({ message: "Unauthorized user" });

        return res.status(200).json({ user });
    } catch (e) {
        return res.status(400).json({ message: e.message });
    }
}