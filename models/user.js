const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validatorUrl = require('validator/lib/isURL');
const validatorEmail = require('validator/lib/isEmail');
const AuthErr = require('../errors/AuthErr');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: validatorEmail,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: validatorUrl,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
});

userSchema.statics.findUserByCredentials = async function (email, password, next) {
  try {
    const user = await this.findOne({ email }).select('+password');

    if (!user) {
      return Promise.reject(new AuthErr('Неправильные почта или пароль'));
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return Promise.reject(new AuthErr('Неправильные почта или пароль'));
    }

    return user;
  } catch (err) {
    next(err);
  }
};

module.exports = mongoose.model('user', userSchema);
