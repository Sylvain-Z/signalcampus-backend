const Logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  Logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
};
