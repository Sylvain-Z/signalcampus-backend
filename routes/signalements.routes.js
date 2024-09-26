const express = require("express");
const router = express.Router();
const signalementController = require("../controllers/signalements.controllers");
const auth = require("../middleware/auth");

/**
 * Middleware pour vérifier si l'utilisateur est un membre du personnel (rôle 1)
 */
const isPersonnel = (req, res, next) => {
  if (req.user.role !== 1) {
    return res.status(403).send({
      message:
        "Accès non autorisé. Seul le personnel peut effectuer cette action.",
    });
  }
  next();
};

/**
 * Route pour créer un nouveau signalement
 * Accessible à tous les utilisateurs authentifiés
 * @route POST /signalements
 */
router.post("/signalements", auth, signalementController.create);

/**
 * Route pour récupérer tous les signalements
 * Accessible uniquement au personnel
 * @route GET /signalements
 */
router.get("/signalements", auth, isPersonnel, signalementController.findAll);

/**
 * Route pour récupérer un signalement spécifique
 * Accessible au créateur du signalement et au personnel
 * @route GET /signalements/:id
 */
router.get(
  "/signalements/:id",
  auth,
  async (req, res, next) => {
    const signalement = await signalement.findByPk(req.params.id);
    if (!signalement) {
      return res.status(404).send({
        message: "Signalement non trouvé.",
      });
    }
    if (req.user.id !== signalement.idUser && req.user.role !== 1) {
      return res.status(403).send({
        message:
          "Accès non autorisé. Vous n'êtes pas le créateur de ce signalement ni un membre du personnel.",
      });
    }
    next();
  },
  signalementController.findOne
);

/**
 * Route pour mettre à jour un signalement
 * Accessible uniquement au personnel
 * @route PUT /signalements/:id
 */
router.put(
  "/signalements/:id",
  auth,
  isPersonnel,
  signalementController.update
);

/**
 * Route pour supprimer un signalement
 * Accessible uniquement au personnel
 * @route DELETE /signalements/:id
 */
router.delete(
  "/signalements/:id",
  auth,
  isPersonnel,
  signalementController.delete
);

/**
 * Route pour récupérer les signalements d'un utilisateur spécifique
 * Accessible à l'utilisateur concerné et au personnel
 * @route GET /users/:userId/signalements
 */
router.get(
  "/users/:userId/signalements",
  auth,
  (req, res, next) => {
    if (req.user.id !== parseInt(req.params.userId) && req.user.role !== 1) {
      return res.status(403).send({
        message:
          "Accès non autorisé. Vous ne pouvez voir que vos propres signalements.",
      });
    }
    next();
  },
  signalementController.findByUser
);

/**
 * Route pour marquer un signalement comme traité
 * Accessible uniquement au personnel
 * @route PUT /signalements/:id/process
 */
router.put(
  "/signalements/:id/process",
  auth,
  isPersonnel,
  signalementController.markAsProcessed
);

module.exports = router;
