const jwt = require('jsonwebtoken');

const db = require('../models');
const User = db.users;

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Token manquant');
    }

    const decodedToken = jwt.verify(token, process.env.jwtToken);
    if (!decodedToken) {
      throw new Error('Token invalide');
    }

    const userId = decodedToken.userId;
    if (!userId) {
      throw new Error('Utilisateur non identifié');
    }

    User.findOne({ where: { id: userId } })
      .then((user) => {
        if (!user) {
          throw new Error('Utilisateur non trouvé');
        }
        // Authentification réussie, on ajoute l'utilisateur à la requête
        req.user = user;
        next();
      })
      .catch((error) => {
        throw new Error(
          `Erreur lors de la récupération de l'utilisateur : ${error.message}`
        );
      });
  } catch (error) {
    res.status(401).json({
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
    });
  }
};
