import jwt from "jsonwebtoken";

/**
 * Admin Authentication Middleware
 * Verifies JWT token and checks if user has ADMIN role
 * 
 * Access is granted if:
 * 1. User has 'ADMIN' role in token, OR
 * 2. User's email matches the admin email in environment variables
 */
const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const adminEmail = process.env.EMAIL_USER;

        if (!authHeader) {
            console.warn("Admin Auth Middleware: No authorization token provided.");
            return res.status(401).json({
                message: "Authentication failed: No token provided. Please login as admin.",
                code: "NO_TOKEN"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            console.warn("Admin Auth Middleware: Malformed authorization header.");
            return res.status(401).json({
                message: "Authentication failed: Malformed token format.",
                code: "MALFORMED_TOKEN"
            });
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY || 'test');

        if (!decodedData) {
            console.warn("Admin Auth Middleware: Token verification returned null.");
            return res.status(401).json({
                message: "Authentication failed: Invalid token data.",
                code: "INVALID_TOKEN"
            });
        }

        // Extract user info for logging
        const userId = decodedData.id;
        const userEmail = decodedData.email;
        const userRole = decodedData.role || 'UNDEFINED';

        // Check if role exists in token
        if (!decodedData.role) {
            console.warn(`Admin Auth Middleware: No role found in token for user: ${userEmail} (${userId})`);
            return res.status(403).json({
                message: "Access denied: No role found in your account. Please contact administrator.",
                code: "NO_ROLE"
            });
        }

        // Check if user has ADMIN role OR is the designated admin email
        const isAdminRole = decodedData.role === 'ADMIN';
        const isAdminEmail = adminEmail && userEmail === adminEmail;
        const hasAdminAccess = isAdminRole || isAdminEmail;

        if (!hasAdminAccess) {
            console.warn(`Admin Auth Middleware: Access denied | User: ${userEmail} (${userId}) | Role: ${userRole} | AdminEmail: ${adminEmail}`);
            return res.status(403).json({
                message: "Access denied: Admin privileges required. Your current role is: " + userRole,
                code: "NOT_ADMIN",
                currentRole: userRole
            });
        }

        // Log successful admin access
        console.log(`Admin Auth Middleware: Access granted | User: ${userEmail} (${userId}) | Role: ${userRole}`);

        // Attach user info to request for downstream use
        req.user = {
            id: userId,
            email: userEmail,
            role: decodedData.role,
            isAdmin: true
        };

        next();
    } catch (e) {
        console.error("Admin Auth Middleware Error:", e.message);

        let message = "Authentication failed: ";
        let code = "AUTH_ERROR";

        if (e.name === 'TokenExpiredError') {
            message = "Session expired. Please login again.";
            code = "TOKEN_EXPIRED";
        } else if (e.name === 'JsonWebTokenError') {
            message = "Invalid token. Please login again.";
            code = "INVALID_TOKEN";
        } else if (e.name === 'NotBeforeError') {
            message = "Token not yet valid. Please try again.";
            code = "TOKEN_NOT_VALID";
        } else {
            message += e.message;
        }

        return res.status(401).json({
            message: message,
            error: e.message,
            code: code
        });
    }
};

export default adminAuth;
