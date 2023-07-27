const jwt = require('jsonwebtoken');
const AuthErr = require('../errors/AuthErr');

module.exports = (req, res, next) => {
  let payload;
  const token = req.cookies.jwt;

  if (!token) {
    next(new AuthErr('Необходима авторизация'));
  }
  try {
    payload = jwt.verify(token, 'some-secret-key');
    req.user = payload;
  } catch (err) {
    next(new AuthErr('Необходима авторизация'));
  }

  next();
};
