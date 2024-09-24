const { Sequelize } = require('sequelize');
const Logger = require('../utils/logger');  // Importation du logger personnalisé

// Configuration de la base de données
// Utilisation des variables d'environnement pour les informations sensibles
const dbConfig = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: "mysql",  // Spécifie le type de base de données utilisé
  pool: {
    max: 10,  // Nombre maximum de connexions dans le pool
    min: 0,   // Nombre minimum de connexions dans le pool
    acquire: 30000,  // Temps maximum en ms pour qu'une connexion soit établie avant de générer une erreur
    idle: 10000,  // Temps maximum en ms pendant lequel une connexion peut être inactive avant d'être libérée
  },
};

// Création d'une instance Sequelize
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,  // Désactive les alias d'opérateurs dépréciés
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

/**
 * Fonction pour tester la connexion à la base de données
 * @returns {Promise<boolean>} - true si la connexion est établie, false sinon
 */
const testConnection = async () => {
  try {
    // Tente d'authentifier la connexion à la base de données
    await sequelize.authenticate();
    Logger.info('Connection to the database has been established successfully.');
    return true;
  } catch (error) {
    // En cas d'erreur lors de la connexion
    Logger.error('Unable to connect to the database:', error);
    return false;
  }
};

// Exporte l'instance Sequelize, la fonction de test et la configuration
module.exports = {
  sequelize,
  testConnection,
  ...dbConfig  // Spread operator pour inclure toutes les propriétés de dbConfig
};