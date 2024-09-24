const winston = require("winston");
const path = require("path");

// Définir les niveaux de log et leurs couleurs
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Définir le format de log
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Définir les transports (où les logs seront écrits)
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/error.log"),
    level: "error",
  }),
  new winston.transports.File({
    filename: path.join(__dirname, "../logs/all.log"),
  }),
];

// Créer le logger
const Logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "warn",
  levels,
  format,
  transports,
});

module.exports = Logger;
