import { rateLimit } from "express-rate-limit"

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute in milliseconds
    max: 5, // Limit each IP to 50 requests per `windowMs`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    // Custom Handler: This runs when the limit is exceeded
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({
            message: "Too many requests, please try again later.",
            retryAfter: Math.ceil(options.windowMs / 1000) + " seconds" // Optional: tell them when to retry
        });
    },
});

export default limiter;
