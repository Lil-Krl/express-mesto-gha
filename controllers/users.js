const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const ConflictError = require('../errors/ConflictError');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});

    res.send(users);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    let action;

    if (req.path === '/me') {
      action = req.user._id;
    } else {
      action = req.params.id;
    }

    const user = await User.findById(action);

    if (!user) {
      throw new NotFound('Пользователь не найден');
    }

    res.send(user);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequest('Переданы некорректные данные'));
    } else {
      next(err);
    }
  }
};

const createUser = async (req, res, next) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, about, avatar, email, password: hash,
    });

    res.status(201).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    });
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError('Пользователь с таким email уже зарегистрирован'));
    } else if (err.name === 'ValidationError') {
      next(new BadRequest('Переданы некорректные данные при создании пользователя'));
    } else {
      next(err);
    }
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });

    res.cookie('jwt', token, {
      maxAge: 3600000 * 24 * 7,
      httpOnly: true,
    });
    res.send({ token });
  } catch (err) {
    next(err);
  }
};

const editProfile = async (req, res, next) => {
  try {
    const action = {};

    if (req.path === '/me/avatar') {
      action.avatar = req.body.avatar;
    } else {
      action.name = req.body.name;
      action.about = req.body.about;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      action,
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new NotFound('Пользователь не найден');
    }

    res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequest(
        `Переданы некорректные данные при обновлении ${req.path === '/me/avatar' ? 'аватара' : 'профиля'}.`,
      ));
    } else {
      next(err);
    }
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  editProfile,
  login,
};
