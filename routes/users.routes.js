const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controllers");
const auth = require("../middleware/auth");

// Routes publiques (ne nécessitent pas d'authentification)

/**
 * Route pour l'inscription d'un nouvel utilisateur
 * @route POST /signup
 * @param {string} login - Le nom d'utilisateur
 * @param {string} password - Le mot de passe
 * @param {number} [role] - Le rôle de l'utilisateur (optionnel)
 */
router.post("/signup", userController.signup);

/**
 * Route pour l'authentification d'un utilisateur
 * @route POST /login
 * @param {string} login - Le nom d'utilisateur
 * @param {string} password - Le mot de passe
 */
router.post("/login", userController.login);

// Routes protégées (nécessitent une authentification)

/**
 * Route pour récupérer tous les utilisateurs
 * Nécessite une authentification
 * @route GET /users
 */
router.get("/users", auth, userController.findAll);

/**
 * Route pour récupérer un utilisateur spécifique
 * Nécessite une authentification
 * @route GET /users/:id
 * @param {string} id - L'ID de l'utilisateur à récupérer
 */
router.get("/users/:id", auth, userController.findOne);

/**
 * Route pour mettre à jour un utilisateur
 * Nécessite une authentification
 * L'utilisateur ne peut mettre à jour que son propre profil, sauf s'il est admin
 * @route PUT /users/:id
 * @param {string} id - L'ID de l'utilisateur à mettre à jour
 */
router.put("/users/:id", auth, userController.update);

/**
 * Route pour supprimer un utilisateur
 * Nécessite une authentification
 * L'utilisateur ne peut supprimer que son propre profil, sauf s'il est admin
 * @route DELETE /users/:id
 * @param {string} id - L'ID de l'utilisateur à supprimer
 */
router.delete("/users/:id", auth, userController.delete);

module.exports = router;
