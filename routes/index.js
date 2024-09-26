const express = require("express");
const router = express.Router();

// Importez vos contrôleurs ici
const signalementController = require("../controllers/signalements.controllers");
const userController = require("../controllers/users.controllers");

// Importez votre middleware d'authentification ici
const auth = require("../middleware/auth");

// Définissez vos routes
router.get("/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Routes pour les signalements
router.post("/signalements", auth, signalementController.create);
router.get("/signalements", signalementController.findAll);
router.get("/signalements/:id", auth, signalementController.findOne);
router.put("/signalements/:id", auth, signalementController.update);
router.delete("/signalements/:id", auth, signalementController.delete);
router.post("/signalements/urgent", signalementController.createUrgent);

// Routes pour les utilisateurs
router.post("/signup", userController.signup );
router.post("/login", userController.login);
router.get("/users", userController.findAll);
router.get("/users/:id", userController.findOne);
router.put("/users/:id", auth, userController.update);
router.get(
  "/users/:userId/signalements",
  auth,
  signalementController.findByUser
);
router.delete("/users/:id", auth, userController.delete);

module.exports = router;