const db = require("../models");
const Signalement = db.signalements;
const NotificationService = require("../utils/notificationService");
const User = require("../models/user");
const Logger = require("../utils/logger");

/**
 * Crée un nouveau signalement
 * @route POST /signalements
 */
exports.create = async (req, res) => {
  try {
    // Extraction des données du corps de la requête
    const { category, place, photos } = req.body;

    // Création du signalement dans la base de données
    const signalement = await Signalement.create({
      idUser: req.user.id,
      category,
      place,
      photos,
    });

    // Journalisation de la création du signalement
    Logger.info(
      `Nouveau signalement créé: ID ${signalement.id} par l'utilisateur ${req.user.id}, catégorie: ${category}`
    );

    // Récupération de tous les membres du personnel (rôle 1)
    const personnel = await User.findAll({ where: { role: 1 } });

    // Vérification si le signalement est urgent basé sur sa catégorie
    const isUrgent = NotificationService.isCategoryUrgent(category);

    // Envoi de notifications à chaque membre du personnel
    for (const p of personnel) {
      await NotificationService.notifyPersonnelNewSignalement(p, signalement);
    }

    // Journalisation supplémentaire pour les signalements urgents
    if (isUrgent) {
      Logger.warn(
        `Signalement URGENT créé: ID ${signalement.id}, catégorie: ${category}`
      );
    }

    // Envoi de la réponse au client
    res.status(201).send(signalement);
  } catch (error) {
    // Journalisation de l'erreur
    Logger.error(
      `Erreur lors de la création d'un signalement: ${error.message}`
    );

    // Envoi de la réponse d'erreur au client
    res.status(500).send({
      message:
        error.message ||
        "Une erreur s'est produite lors de la création du signalement.",
    });
  }
};

/**
 * Récupère tous les signalements avec possibilité de filtrage
 * @route GET /signalements
 */
exports.findAll = async (req, res) => {
  try {
    const { category, isProcessed } = req.query;
    let condition = {};

    // Applique les filtres si spécifiés dans la requête
    if (category) {
      condition.category = category;
    }
    if (isProcessed !== undefined) {
      condition.isProcessed = isProcessed === "true";
    }

    const signalements = await Signalement.findAll({ where: condition });
    res.send(signalements);
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Une erreur s'est produite lors de la récupération des signalements.",
    });
  }
};

/**
 * Récupère un signalement spécifique par son ID
 * @route GET /signalements/:id
 */
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const signalement = await Signalement.findByPk(id);
    if (signalement) {
      res.send(signalement);
    } else {
      res.status(404).send({
        message: `Signalement avec l'id=${id} non trouvé.`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Erreur lors de la récupération du signalement avec l'id=" + id,
    });
  }
};

/**
 * Met à jour un signalement existant
 * @route PUT /signalements/:id
 */
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    // Vérifier si l'utilisateur est un personnel (rôle 1)
    if (req.user.role !== 1) {
      return res.status(403).send({
        message:
          "Accès non autorisé. Seul le personnel peut mettre à jour les signalements.",
      });
    }

    const [num] = await Signalement.update(req.body, {
      where: { id: id },
    });

    if (num == 1) {
      res.send({
        message: "Le signalement a été mis à jour avec succès.",
      });
    } else {
      res.send({
        message: `Impossible de mettre à jour le signalement avec l'id=${id}. Peut-être que le signalement n'a pas été trouvé ou req.body est vide!`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Erreur lors de la mise à jour du signalement avec l'id=" + id,
    });
  }
};

/**
 * Supprime un signalement
 * @route DELETE /signalements/:id
 */
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    // Vérifier si l'utilisateur est un personnel (rôle 1)
    if (req.user.role !== 1) {
      return res.status(403).send({
        message:
          "Accès non autorisé. Seul le personnel peut supprimer les signalements.",
      });
    }

    const num = await Signalement.destroy({
      where: { id: id },
    });

    if (num == 1) {
      res.send({
        message: "Le signalement a été supprimé avec succès!",
      });
    } else {
      res.send({
        message: `Impossible de supprimer le signalement avec l'id=${id}. Peut-être que le signalement n'a pas été trouvé!`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Impossible de supprimer le signalement avec l'id=" + id,
    });
  }
};

/**
 * Récupère tous les signalements d'un utilisateur spécifique
 * @route GET /users/:userId/signalements
 */
exports.findByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const signalements = await Signalement.findAll({
      where: { idUser: userId },
    });
    res.send(signalements);
  } catch (error) {
    res.status(500).send({
      message: `Erreur lors de la récupération des signalements pour l'utilisateur avec l'id=${userId}`,
    });
  }
};

/**
 * Marque un signalement comme traité
 * @route PUT /signalements/:id/process
 */
exports.markAsProcessed = async (req, res) => {
  const id = req.params.id;
  try {
    if (req.user.role !== 1) {
      return res.status(403).send({
        message:
          "Accès non autorisé. Seul le personnel peut marquer les signalements comme traités.",
      });
    }

    const [num] = await Signalement.update(
      { isProcessed: true },
      { where: { id: id } }
    );

    Logger.info(
      `Signalement ID ${id} marqué comme traité par l'utilisateur ${req.user.id}`
    );
    if (num == 1) {
      res.send({
        message: "Le signalement a été marqué comme traité avec succès.",
      });
    } else {
      res.send({
        message: `Impossible de marquer le signalement avec l'id=${id} comme traité. Peut-être que le signalement n'a pas été trouvé!`,
      });
    }
  } catch (error) {
    Logger.error(
      `Erreur lors du traitement du signalement ID ${id}: ${error.message}`
    );
    res.status(500).send({
      message:
        "Erreur lors du marquage du signalement comme traité avec l'id=" + id,
    });
  }
};
