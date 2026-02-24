const User = require("../models/user");
const bcrypt = require('bcryptjs');
const { sendMail } = require("../utils/emails");
const { generateOTP } = require("../utils/generateOtp");
const Otp = require("../models/otp");
const { sanitizeUser } = require("../utils/sanitizeUser");
const { generateToken } = require("../utils/generateToken");
const PasswordResetToken = require("../models/passwordResetToken");
const mongoose = require("mongoose");


// Cookie Options Utility
const cookieOptions = {
    httpOnly: true,
    secure: process.env.PRODUCTION === 'true',
    sameSite: process.env.PRODUCTION === 'true' ? "None" : 'Lax',
    maxAge: parseInt(process.env.COOKIE_EXPIRATION_DAYS || 1) * 24 * 60 * 60 * 1000
};

// --- AUTHENTICATION LOGIC ---

exports.signup = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const createdUser = new User({ ...req.body, password: hashedPassword });
        await createdUser.save();

        const secureInfo = sanitizeUser(createdUser);
        const token = generateToken(secureInfo);

        res.cookie('token', token, cookieOptions).status(201).json(secureInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error occurred during signup" });
    }
};

exports.login = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser && (await bcrypt.compare(req.body.password, existingUser.password))) {
            const secureInfo = sanitizeUser(existingUser);
            const token = generateToken(secureInfo);

            return res.cookie('token', token, cookieOptions).status(200).json(secureInfo);
        }

        res.status(401).json({ message: "Invalid Credentials" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while logging in' });
    }
};

exports.logout = async (req, res) => {
    try {
        res.cookie('token', '', { ...cookieOptions, maxAge: 0 });
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: "Logout failed" });
    }
};

exports.checkAuth = async (req, res) => {
    try {
        if (req.user) {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({ message: "User not found" });
            return res.status(200).json(sanitizeUser(user));
        }
        res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
        res.status(500).json({ message: "Server error during check-auth" });
    }
};

// --- USER PROFILE LOGIC ---

// exports.getProfile = async (req, res) => {
//     try {
//         // req.user is populated by your verifyToken middleware
//         const user = await User.findById(req.user._id).select("-password");
//
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }
//
//         // Using sanitizeUser to keep data consistent with login/signup
//         res.status(200).json(sanitizeUser(user));
//     } catch (error) {
//         console.error("Get Profile Error:", error);
//         res.status(500).json({ message: "Error fetching profile" });
//     }
// };


exports.getProfile = async (req, res) => {
    try {
        // 1. Fetch the user
        // 2. Populate 'addresses' and 'orders' if they are referenced in the schema
        // OR manually query them if they are only referenced in the sub-collections
        const user = await User.findById(req.user._id).select("-password").lean();

        console.log(user, "user....")
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Fetch related data from other collections
        const [addresses, orders] = await Promise.all([
            mongoose.model("Address").find({ user: user._id }),
            mongoose.model("Order").find({ user: user._id }).sort({ createdAt: -1 })
        ]);

        // 4. Combine data into one "Complete Profile" object
        const completeProfile = {
            ...user,
            addresses,
            orders
        };

        res.status(200).json(completeProfile);
    } catch (error) {
        console.error("Complete Profile Fetch Error:", error);
        res.status(500).json({ message: "Error fetching complete profile data" });
    }
};


exports.updateProfile = async (req, res) => {
    try {
        // Prevent password updates through this route for security
        if (req.body.password) {
            delete req.body.password;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            req.body,
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json(sanitizeUser(updatedUser));
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Error updating profile" });
    }
};

// --- OTP & PASSWORD RECOVERY LOGIC ---

exports.verifyOtp = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otpDoc = await Otp.findOne({ user: userId });
        if (!otpDoc) return res.status(404).json({ message: 'OTP not found' });

        if (otpDoc.expiresAt < new Date()) {
            await Otp.findByIdAndDelete(otpDoc._id);
            return res.status(400).json({ message: "OTP has expired" });
        }

        if (await bcrypt.compare(otp, otpDoc.otp)) {
            await Otp.findByIdAndDelete(otpDoc._id);
            const verifiedUser = await User.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
            return res.status(200).json(sanitizeUser(verifiedUser));
        }

        return res.status(400).json({ message: 'Invalid OTP' });
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "Email does not exist" });

        await PasswordResetToken.deleteMany({ user: user._id });

        const resetToken = generateToken(sanitizeUser(user), true);
        const hashedToken = await bcrypt.hash(resetToken, 10);

        await new PasswordResetToken({
            user: user._id,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 20 * 60 * 1000)
        }).save();

        const resetLink = `${process.env.ORIGIN}/reset-password/${user._id}/${resetToken}`;
        await sendMail(user.email, 'Password Reset', `Click here to reset: ${resetLink}`);

        res.status(200).json({ message: `Reset link sent to ${user.email}` });
    } catch (error) {
        res.status(500).json({ message: 'Error sending reset mail' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { userId, token, password } = req.body;
        const resetDoc = await PasswordResetToken.findOne({ user: userId });

        if (!resetDoc || resetDoc.expiresAt < new Date() || !(await bcrypt.compare(token, resetDoc.token))) {
            if (resetDoc) await PasswordResetToken.findByIdAndDelete(resetDoc._id);
            return res.status(400).json({ message: "Reset link is invalid or expired" });
        }

        const newHashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(userId, { password: newHashedPassword });
        await PasswordResetToken.findByIdAndDelete(resetDoc._id);

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password" });
    }
};