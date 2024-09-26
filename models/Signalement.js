module.exports = (sequelize, Sequelize) => {
  const Signalement = sequelize.define("signalements", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idUser: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    category: {
      type: Sequelize.INTEGER,
      validate: {
        isIn: [[1, 2, 3, 4]], // Utilisez des nombres au lieu de chaînes
      },
      defaultValue: 4,
    },
    hours: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    place: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    // Nouveau champ pour stocker les chemins des photos
    // photos: {
    //   type: Sequelize.ARRAY(Sequelize.STRING),
    //   allowNull: true,
    // },
    photos: {
      type: Sequelize.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("photos");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("photos", JSON.stringify(value));
      },
    },
    // Champ pour indiquer si le signalement a été traité
    isProcessed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    // Champ pour stocker les commentaires du personnel
    personnelComments: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  });

  return Signalement;
};
