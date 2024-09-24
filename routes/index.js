const express = require("express");
const router = express.Router();

// Importez vos contrôleurs ici
const signalementController = require("../controllers/signalements.controllers");
const userController = require("../controllers/users.controllers");

// Définissez vos routes
router.get("/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Routes pour les signalements
router.post("/signalements", signalementController.create);
router.get("/signalements", signalementController.findAll);
router.get("/signalements/:id", signalementController.findOne);
router.put("/signalements/:id", signalementController.update);
router.delete("/signalements/:id", signalementController.delete);

// Routes pour les utilisateurs
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/users", userController.findAll);
router.get("/users/:id", userController.findOne);
router.put("/users/:id", userController.update);
router.delete("/users/:id", userController.delete);

module.exports = router;
