import express from "express";
import auth from "../middleware/auth.js";
import { login, verifyRole, verifyUser, signup, verifyOtp, forgotPassword, resetPassword } from "../controller/me/Authentication.js";
import { getWishlist, updateWishlist } from "../controller/me/Wishlist.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/test-email', async (req, res) => {
    try {
        // Assuming sendEmail is a utility function that needs to be imported or defined.
        // For the purpose of this change, I'm adding the route as provided.
        // Note: `forgotPassword` is already imported, and `sendEmail` would need to be imported.
        // For a functional test email, you'd typically import a `sendEmail` utility.
        // As per the instruction to make the change faithfully, I'm including the line as given,
        // but it might require further context for `sendEmail` to be defined.
        const { default: sendEmail } = await import('../utils/sendEmail.js');
        const email = req.query.email || process.env.EMAIL_USER;
        await sendEmail(email, "Test Email", "This is a test to verify SMTP settings on Render.");
        res.status(200).json({ message: "Test email sent successfully to " + email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/verify', auth, verifyUser);
router.post('/role', verifyRole)

router.get('/wishlist', auth, getWishlist);
router.patch('/wishlist', auth, updateWishlist);

export default router;