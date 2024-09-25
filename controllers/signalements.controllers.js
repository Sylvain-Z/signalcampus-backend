const db = require('../models');
const Signalement = db.signalements;
const NotificationService = require('../utils/notificationService');
const User = db.users;
const Logger = require('../utils/logger');

/**
 * Crée un nouveau signalement
 * @route POST /signalements
 */
exports.create = async (req, res) => {
  try {
    console.log('Début de la création du signalement');
    console.log('Données de la requête:', req.body);
    console.log('Utilisateur:', req.user);

    // Vérification de l'authentification
    if (!req.user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Extraction des données
    const { category, place, reportingContent } = req.body;

    // Création du signalement
    const signalement = await Signalement.create({
      idUser: req.user.id,
      category,
      place,
      reportingContent,
    });

    console.log('Signalement créé avec succès:', signalement.id);

    // Récupération du personnel (si nécessaire)
    const personnel = await User.findAll({ where: { role: 1 } });
    console.log('Nombre de personnel notifié:', personnel.length);

    // Envoi de notifications (si nécessaire)
    for (const p of personnel) {
      await NotificationService.notifyPersonnelNewSignalement(p, signalement);
    }

    console.log('Notifications envoyées avec succès');

    // Envoyer la réponse
    res.status(201).send(signalement);
  } catch (error) {
    console.error('Erreur détaillée:', error);
    Logger.error(
      `Erreur lors de la création d'un signalement: ${error.message}`
    );
    // Vérifier si la réponse n'a pas déjà été envoyée
    if (!res.headersSent) {
      res.status(500).send({
        message:
          "Une erreur s'est produite lors de la création du signalement.",
        error: error.message,
      });
    } else {
      console.error("Erreur après l'envoi de la réponse:", error);
    }
  } finally {
    console.log('Fin du traitement de la création du signalement');
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
      condition.isProcessed = isProcessed === 'true';
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
 * Récupère tous les signalements d'un utilisateur spécifique
 * @route GET /users/:userId/signalements
 */
exports.findByUser = async (req, res) => {
  const userId = req.params.userId;
  console.log(`Récupération des signalements pour l'utilisateur ${userId}`);
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
          'Accès non autorisé. Seul le personnel peut mettre à jour les signalements.',
      });
    }

    const [num] = await Signalement.update(req.body, {
      where: { id: id },
    });

    if (num == 1) {
      res.send({
        message: 'Le signalement a été mis à jour avec succès.',
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
          'Accès non autorisé. Seul le personnel peut supprimer les signalements.',
      });
    }

    const num = await Signalement.destroy({
      where: { id: id },
    });

    if (num == 1) {
      res.send({
        message: 'Le signalement a été supprimé avec succès!',
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
          'Accès non autorisé. Seul le personnel peut marquer les signalements comme traités.',
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
        message: 'Le signalement a été marqué comme traité avec succès.',
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
