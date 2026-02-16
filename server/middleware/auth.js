import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    try {
        // console.log("Auth Middleware: Headers:", req.headers); // Uncomment for debugging

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            console.warn("Auth Middleware: No authorization token provided.");
            return res.status(401).json({
                message: "Authentication failed: No token provided. Please login.",
                code: "NO_TOKEN"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            console.warn("Auth Middleware: Malformed authorization header.");
            return res.status(401).json({
                message: "Authentication failed: Malformed token.",
                code: "MALFORMED_TOKEN"
            });
        }

        if (!process.env.JWT_SECRET_KEY) {
            console.error("Auth Middleware: JWT_SECRET_KEY is MISSING in environment.");
            return res.status(500).json({
                message: "Internal Server Configuration Error",
                code: "CONFIG_ERROR"
            });
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!decodedData) {
            console.warn("Auth Middleware: Token verification failed (returned null/undefined).");
            return res.status(401).json({
                message: "Authentication failed: Invalid token.",
                code: "INVALID_TOKEN"
            });
        }

        req.user = decodedData; // BEST PRACTICE
        next();
    } catch (e) {
        console.error("Auth Middleware Error:", e.message);
        const message = e.name === 'TokenExpiredError' ? "Session expired. Please login again." : "Authentication failed.";
        return res.status(401).json({
            message: message,
            error: e.message,
            code: "AUTH_ERROR"
        });
    }
};

export default auth;
