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
        isIn: [[0, 1, 2, 3, 4]], // Ajout de 0 pour correspondre aux valeurs du formulaire
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
    isProcessed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    personnelComments: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  });

  return Signalement;
};