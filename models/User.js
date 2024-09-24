module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    login: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    role: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isIn: [[0, 1]]
      },
    },
  });

  return User;
};
