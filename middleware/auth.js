const jwt = require('jsonwebtoken');

exports.verifyToken = async (req, res, next) => {
    try {
        // Ensure req.cookies exists (requires cookie-parser)
        if (!req.cookies) {
            console.error("Cookie-parser is not initialized in your main server file.");
            return res.status(500).json({ message: "Server configuration error" });
        }

        // 1. Extract token from cookies
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "Token missing, please login again" });
        }

        // 2. Verify the token
        // Use the exact variable from your .env file
        const decodedInfo = jwt.verify(token, process.env.SECRET_KEY);

        // 3. Validation & Injection
        if (decodedInfo && decodedInfo._id) {
            req.user = decodedInfo;
            return next();
        }

        return res.status(401).json({ message: "Invalid Token payload, please login again" });

    } catch (error) {
        console.error("JWT Verification Error:", error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired, please login again" });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid Token, please login again" });
        }

        return res.status(500).json({ message: "Internal Server Error" });
    }
};