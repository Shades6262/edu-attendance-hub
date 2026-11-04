// in-memory limiter; on Vercel it resets per serverless instance (fine for this project)
const makeLimiter = ({ windowMs, max, keyFn, message }) => {
  const hits = new Map();
  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) return res.status(429).json({ message });
    recent.push(now);
    hits.set(key, recent);
    next();
  };
};

module.exports = makeLimiter;