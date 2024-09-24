const db = require("../models");
const User = db.users;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { log } = require("winston");

const SALT_ROUNDS = 10; // Nombre de tours de salage pour bcrypt

/**
 * Inscrit un nouvel utilisateur
 * @route POST /signup
 */
const Logger = require("../utils/logger"); // Assurez-vous d'importer votre logger

exports.signup = async (req, res) => {
  try {
    Logger.info("Début de la fonction signup");
    Logger.debug("Corps de la requête reçue:", req.body);

    const { login, password } = req.body;

    if (!login || !password) {
      Logger.warn(
        "Tentative de création d'utilisateur sans login ou mot de passe"
      );
      return res.status(400).send({
        message: "Le login et le mot de passe sont requis !",
      });
    }

    Logger.info(`Tentative de création d'utilisateur avec le login: ${login}`);

    Logger.debug("Hachage du mot de passe");
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    Logger.debug("Mot de passe haché avec succès");

    Logger.info("Création de l'utilisateur dans la base de données");
    const user = await User.create({
      login,
      password: hashedPassword,
    });
    Logger.info(`Utilisateur créé avec succès. ID: ${user.id}`);

    Logger.debug("Détails de l'utilisateur créé:", {
      id: user.id,
      login: user.login,
      role: user.role,
    });

    res.status(201).send({
      message: "Utilisateur créé avec succès",
      user: { id: user.id, login: user.login, role: user.role },
    });
    Logger.info("Réponse envoyée au client avec succès");
  } catch (err) {
    Logger.error("Erreur lors de la création de l'utilisateur:", err);
    Logger.debug("Détails de l'erreur:", err.stack);
    res.status(500).send({
      message:
        err.message ||
        "Une erreur s'est produite lors de la création de l'utilisateur.",
    });
  }
};

/**
 * Authentifie un utilisateur
 * @route POST /login
 */
exports.login = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Recherche de l'utilisateur dans la base de données
    const user = await User.findOne({ where: { login } });

    if (!user) {
      return res.status(404).send({ message: "Utilisateur non trouvé." });
    }

    // Vérification du mot de passe
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Mot de passe incorrect !",
      });
    }

    // Génération du token JWT
    const token = jwt.sign({ userId: user.id }, process.env.jwtToken, {
      expiresIn: "24h",
    });

    // Réponse avec les détails de l'utilisateur et le token
    res.status(200).send({
      userId: user.id,
      login: user.login,
      role: user.role,
      token: token,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Une erreur s'est produite lors de la connexion.",
    });
  }
};

/**
 * Récupère tous les utilisateurs
 * @route GET /users
 */
exports.findAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "login", "role"], // Exclut le mot de passe des résultats
    });
    res.send(users);
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        "Une erreur s'est produite lors de la récupération des utilisateurs.",
    });
  }
};

/**
 * Récupère un utilisateur spécifique
 * @route GET /users/:id
 */
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id, {
      attributes: ["id", "login", "role"], // Exclut le mot de passe des résultats
    });

    if (user) {
      res.send(user);
    } else {
      res.status(404).send({
        message: `Impossible de trouver l'utilisateur avec l'id=${id}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message:
        "Erreur lors de la récupération de l'utilisateur avec l'id=" + id,
    });
  }
};

/**
 * Met à jour un utilisateur
 * @route PUT /users/:id
 */
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    // Vérification des droits d'accès
    if (req.user.id != id && req.user.role !== 1) {
      return res.status(403).send({
        message: "Vous n'avez pas les droits pour effectuer cette action.",
      });
    }

    // Si un nouveau mot de passe est fourni, le hacher
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    }

    // Mise à jour de l'utilisateur
    const [num] = await User.update(req.body, {
      where: { id: id },
    });

    if (num == 1) {
      res.send({
        message: "L'utilisateur a été mis à jour avec succès.",
      });
    } else {
      res.send({
        message: `Impossible de mettre à jour l'utilisateur avec l'id=${id}. Peut-être que l'utilisateur n'a pas été trouvé ou req.body est vide !`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Erreur lors de la mise à jour de l'utilisateur avec l'id=" + id,
    });
  }
};

/**
 * Supprime un utilisateur
 * @route DELETE /users/:id
 */
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    // Vérification des droits d'accès
    if (req.user.id != id && req.user.role !== 1) {
      return res.status(403).send({
        message: "Vous n'avez pas les droits pour effectuer cette action.",
      });
    }

    // Suppression de l'utilisateur
    const num = await User.destroy({
      where: { id: id },
    });

    if (num == 1) {
      res.send({
        message: "L'utilisateur a été supprimé avec succès !",
      });
    } else {
      res.send({
        message: `Impossible de supprimer l'utilisateur avec l'id=${id}. Peut-être que l'utilisateur n'a pas été trouvé !`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Impossible de supprimer l'utilisateur avec l'id=" + id,
    });
  }
};
