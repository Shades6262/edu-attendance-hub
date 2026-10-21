// Simple per-user limiter. In-memory, so on Vercel it resets per serverless
// instance. That's fine for a school project, but it isn't a hard guarantee.
const hits = new Map();
const WINDOW_MS = 60 * 1000;
const LIMITS = { student: 8, instructor: 15, admin: 15 }; // requests per minute

const aiRateLimit = (req, res, next) => {
  const limit = LIMITS[req.user.role] || 8;
  const now = Date.now();
  const recent = (hits.get(req.user.id) || []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= limit) {
    return res.status(429).json({ message: 'Too many requests. Wait a minute and try again.' });
  }

  recent.push(now);
  hits.set(req.user.id, recent);
  next();
};

module.exports = aiRateLimit;