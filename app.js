const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes"); // Fichier contenant toutes les routes API
const errorHandler = require("./middleware/errorHandler");
const db = require("./models");
const Logger = require("./utils/logger");
const { testConnection } = require("./database/connection");

// Création de l'application Express
const app = express();

const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_NAME"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`La variable d'environnement ${envVar} n'est pas définie.`);
  }
}

// Gestion spéciale pour DB_PASSWORD
if (process.env.DB_PASSWORD === undefined) {
  console.warn(
    "Aucun mot de passe défini pour la base de données. Assurez-vous que c'est intentionnel."
  );
  process.env.DB_PASSWORD = null; // Utilisation de null pour indiquer explicitement l'absence de mot de passe
}

// Affichage des variables d'environnement (pour le débogage)
console.log("Variables d'environnement chargées :");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log(
  "DB_PASSWORD:",
  process.env.DB_PASSWORD === null ? "[NON DÉFINI]" : "[DÉFINI]"
);
console.log("DB_NAME:", process.env.DB_NAME);

// Middleware pour permettre les requêtes cross-origin
app.use(cors());

// Middleware pour ajouter des en-têtes de sécurité
app.use(helmet());

// Middleware pour le logging des requêtes HTTP
app.use(
  morgan("combined", {
    stream: { write: (message) => Logger.info(message.trim()) },
  })
);

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Middleware pour parser les données URL-encodées
app.use(express.urlencoded({ extended: true }));

// Utilisation des routes API définies dans le fichier routes/index.js
app.use("/api", routes);

// // Configuration pour servir les fichiers statiques en production
// if (process.env.NODE_ENV === "production") {
//   // Sert les fichiers statiques du build de React
//   app.use(express.static(path.join(__dirname, "../frontend/build")));

//   // Pour toutes les requêtes qui ne sont pas des API, renvoie l'application React
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
//   });
// }

// Middleware de gestion des erreurs
app.use(errorHandler);

testConnection()
  .then((result) => {
    if (result) {
      Logger.info("Connexion à la base de données établie avec succès.");
    } else {
      Logger.error("Impossible de se connecter à la base de données.");
    }
  })
  .catch((err) => {
    Logger.error("Impossible de se connecter à la base de données:", err);
  });

db.sequelize
  .sync({ alter: true }) // Utilisez { force: true } avec précaution en production
  .then(() => {
    Logger.info("Base de données synchronisée");
  })
  .catch((err) => {
    Logger.error(
      "Erreur lors de la synchronisation de la base de données:",
      err
    );
  });

db.sequelize
  .authenticate()
  .then(() => {
    Logger.info("Connexion à la base de données établie avec succès.");
  })
  .catch((err) => {
    Logger.error("Impossible de se connecter à la base de données:", err);
  });

// Exportation de l'application configurée
module.exports = app;
