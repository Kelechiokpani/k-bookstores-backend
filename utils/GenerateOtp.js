// exports.generateOTP=()=>{
//     const otp = Math.floor(1000 + Math.random() * 9000);
//     return otp.toString();
//   }

const crypto = require('crypto');

/**
 * Generates a cryptographically secure 6-digit OTP.
 * (6 digits is standard for better security than 4)
 */
exports.generateOTP = () => {
    // Generates a random number between 100000 and 999999
    const otp = crypto.randomInt(100000, 999999);
    return otp.toString();
};