const nodemailer = require('nodemailer');
const Logger = require('./logger');

class NotificationService {
  constructor() {
    // Configuration du transporteur d'email
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Définition des catégories de harcèlement
    this.CATEGORIES = {
      MORAL: 0,
      PHYSICAL: 1,
      SEXUAL: 2,
      CYBER: 3,
    };

    // Définition des catégories considérées comme urgentes
    this.URGENT_CATEGORIES = [this.CATEGORIES.PHYSICAL, this.CATEGORIES.SEXUAL];
  }

  /**
   * Envoie un email
   * @param {string} to - Adresse email du destinataire
   * @param {string} subject - Sujet de l'email
   * @param {string} text - Contenu de l'email
   * @param {boolean} isUrgent - Indique si l'email est urgent
   */
  async sendEmail(to, subject, text, isUrgent = false) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: isUrgent ? `URGENT: ${subject}` : subject,
        text,
        priority: isUrgent ? 'high' : 'normal',
      });
      Logger.info(`Email ${isUrgent ? 'urgent ' : ''}envoyé à ${to}`);
    } catch (error) {
      Logger.error(
        `Erreur lors de l'envoi de l'email à ${to}: ${error.message}`
      );
    }
  }

  /**
   * Notifie un utilisateur que son signalement a été traité
   * @param {Object} user - L'objet utilisateur
   * @param {number} signalementId - L'ID du signalement traité
   */
  async notifyUserSignalementProcessed(user, signalementId) {
    const subject = 'Votre signalement a été traité';
    const text = `Bonjour,\n\nVotre signalement (ID: ${signalementId}) a été traité. Merci pour votre contribution.\n\nCordialement,\nL'équipe de support`;
    await this.sendEmail(user.email, subject, text);
  }

  /**
   * Notifie le personnel d'un nouveau signalement
   * @param {Object} personnel - L'objet représentant le membre du personnel
   * @param {Object} signalement - L'objet signalement
   */
  async notifyPersonnelNewSignalement(personnel, signalement) {
    const isUrgent = this.URGENT_CATEGORIES.includes(signalement.category);
    const subject = 'Nouveau signalement';
    const categoryName = Object.keys(this.CATEGORIES).find(
      (key) => this.CATEGORIES[key] === signalement.category
    );
    const text = `Bonjour,\n\nUn nouveau signalement ${
      isUrgent ? 'URGENT ' : ''
    }(ID: ${
      signalement.id
    }) a été créé et nécessite votre attention immédiate.\n\nCatégorie: ${categoryName}\nLieu: ${
      signalement.place
    }\n\nVeuillez traiter ce signalement ${
      isUrgent ? 'en priorité' : 'dès que possible'
    }.\n\nCordialement,\nSystème de gestion des signalements`;
    await this.sendEmail(personnel.email, subject, text, isUrgent);
  }

  /**
   * Vérifie si une catégorie est considérée comme urgente
   * @param {number} category - L'ID de la catégorie
   * @returns {boolean} - True si la catégorie est urgente, false sinon
   */
  isCategoryUrgent(category) {
    return this.URGENT_CATEGORIES.includes(category);
  }
}

module.exports = new NotificationService();
