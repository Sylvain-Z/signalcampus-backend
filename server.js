const dotenv = require("dotenv");
const result = dotenv.config();
const http = require("http");
const app = require("./app");
const Logger = require("./utils/logger");

if (result.error) {
  throw result.error;
}

console.log("Variables d'environnement chargées :", process.env);

// Vérifiez que les variables nécessaires sont définies
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`La variable d'environnement ${envVar} n'est pas définie.`);
  }
}

/**
 * Normalise un port en un nombre, une chaîne ou false.
 * @param {string|number} val - La valeur du port à normaliser
 * @returns {number|string|boolean} - Le port normalisé
 */
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val; // retourne la valeur si ce n'est pas un nombre
  }
  if (port >= 0) {
    return port; // retourne le port si c'est un nombre positif
  }
  return false; // retourne false pour toute autre valeur
};

// Définit le port sur lequel le serveur va écouter
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

// Crée le serveur HTTP avec l'application Express
const server = http.createServer(app);

// Le serveur commence à écouter sur le port spécifié
server.listen(port);

// Gestion des erreurs du serveur
server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // Gestion des erreurs spécifiques avec des messages explicites
  switch (error.code) {
    case "EACCES":
      Logger.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      Logger.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Événement émis lorsque le serveur commence à écouter
server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  Logger.info("Listening on " + bind);
});
