import jwt from "jsonwebtoken";

/**
 * Admin Authentication Middleware
 * Verifies JWT token and checks if user has ADMIN role
 */
const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.warn("Admin Auth Middleware: No authorization token provided.");
            return res.status(401).json({
                message: "Authentication failed: No token provided. Please login.",
                code: "NO_TOKEN"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            console.warn("Admin Auth Middleware: Malformed authorization header.");
            return res.status(401).json({
                message: "Authentication failed: Malformed token.",
                code: "MALFORMED_TOKEN"
            });
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY || 'test');

        if (!decodedData) {
            console.warn("Admin Auth Middleware: Token verification failed.");
            return res.status(401).json({
                message: "Authentication failed: Invalid token.",
                code: "INVALID_TOKEN"
            });
        }

        // Check if user has ADMIN role
        if (decodedData.role !== 'ADMIN') {
            console.warn("Admin Auth Middleware: Non-admin user attempted admin access.", {
                userId: decodedData.id,
                userRole: decodedData.role
            });
            return res.status(403).json({
                message: "Access denied: Admin privileges required.",
                code: "NOT_ADMIN"
            });
        }

        req.user = decodedData;
        next();
    } catch (e) {
        console.error("Admin Auth Middleware Error:", e.message);
        const message = e.name === 'TokenExpiredError' 
            ? "Session expired. Please login again." 
            : "Authentication failed.";
        return res.status(401).json({
            message: message,
            error: e.message,
            code: "AUTH_ERROR"
        });
    }
};

export default adminAuth;
