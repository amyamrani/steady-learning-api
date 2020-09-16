const UserService = require('./users/users-service');

function validateBearerToken(req, res, next) {
  try {
    const authHeader = req.get('Authorization')
    const authToken = authHeader.split(' ')[1]

    UserService.getByToken(
      req.app.get('db'),
      authToken
    )
      .then(user => {
        if (!user) {
          res.status(401).json({ error: 'Unauthorized request' });
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        next(err);
      });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized request' });
  };
}

module.exports = validateBearerToken