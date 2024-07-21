import rateLimit from 'express-rate-limit';

// 3 minutes rate limit on otp
export const otpRateLimit = rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 5, 
    message: 'Too many otp attempts, please try again after 3 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});