const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { login, createUser } = require('./controllers/users');
const handleError = require('./middlewares/handleError');
const auth = require('./middlewares/auth');
const { validationLogin, validationCreateUser } = require('./middlewares/validation');

const {
  MONGODB_URL = 'mongodb://127.0.0.1:27017/mestodb',
  PORT = 3000,
} = process.env;

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signin', validationLogin, login);
app.post('/signup', validationCreateUser, createUser);

app.use(auth);

app.use('/cards', cardsRouter);
app.use('/users', usersRouter);
app.use('*', (req, res) => {
  res.status(404).send({
    message: 'Запрашиваемый адрес не найден.',
  });
});
app.use(errors());
app.use(handleError);

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
      useNewUrlParser: true,
    });
    console.log(`Установлено соединение - ${MONGODB_URL}`);
    await app.listen(PORT);
    console.log(`Сервер работает на порту - ${PORT}`);
  } catch (err) {
    console.log('Ошибка подключения к MongoDB', err);
  }
};

startServer();
