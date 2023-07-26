const userRoutes = require('express').Router();

const {
  getUsers,
  getCurrentUser,
  getUserById,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

const {
  validationUpdateUser,
  validationUpdateAvatar,
  validationUserId,
} = require('../middlewares/validation');

userRoutes.get('/', getUsers);
userRoutes.get('/:userId', validationUserId, getUserById);
userRoutes.get('/me', getCurrentUser);
userRoutes.patch('/me', validationUpdateUser, updateUser);
userRoutes.patch('/me/avatar', validationUpdateAvatar, updateAvatar);

module.exports = userRoutes;
