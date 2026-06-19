// middleware/logger.js
// Logs every incoming request with method, endpoint, and date/time

const logger = (req, res, next) => {
  const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
  console.log(`[${now}]  ${req.method}  ${req.originalUrl}`);
  next();
};

module.exports = logger;
