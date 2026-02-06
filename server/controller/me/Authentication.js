import Users from "../../model/Users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

/* ========= MAIL SETUP ========= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:"dhameliyajemish92@gmail.com" ,
    pass: "eoxtjwyzmsehxhry"
  }
});

/* ========= SIGNUP ========= */

export const signup = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    let user = await Users.findOne({ email });

    // 🔥 If user exists but OTP still valid → don't regenerate
    if (user && user.otpExpire > Date.now()) {
      return res.json({ message: "OTP already sent. Check your email." });
    }

    if (!user) {
      const hashed = await bcrypt.hash(password, 10);

      user = await Users.create({
        first_name,
        last_name,
        email,
        password: hashed,
        verified: false
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // ⏱ 10 minutes now
    await user.save();

    res.json({ message: "OTP sent to email" });

    transporter.sendMail({
      to: email,
      subject: "Verify your account",
      html: `<h2>Your OTP: ${otp}</h2>`
    }).catch(console.log);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========= VERIFY OTP ========= */

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await Users.findOne({
      email,
      otp: Number(otp),
      otpExpire: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.verified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    res.json({ message: "Account verified successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};






export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    if (!user.verified)
      return res.status(401).json({ message: "Verify email first" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ========= FORGOT PASSWORD ========= */

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const link = `http://localhost:3000/reset/${token}`;

    transporter.sendMail({
      to: email,
      subject: "Reset Password",
      html: `Click here to reset password: <a href="${link}">${link}</a>`
    }).catch(console.log);

    res.json({ message: "Reset link sent to email" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========= RESET PASSWORD ========= */

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await Users.findOne({
      resetToken: token,
      resetExpire: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetExpire = null;
    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
