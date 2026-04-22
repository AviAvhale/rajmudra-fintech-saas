// ─── Rate Limiting DISABLED for development ───────────────────────────────────
// To re-enable, uncomment the rateLimit-based code and remove the passthrough.

const noOp = (req, res, next) => next();

const loginLimiter    = noOp;
const registerLimiter = noOp;
const apiLimiter      = noOp;

module.exports = { loginLimiter, registerLimiter, apiLimiter };

