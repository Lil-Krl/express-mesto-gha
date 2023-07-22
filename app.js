const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const router = require('./routes');

const app = express();

app.use(bodyParser.json());

const { PORT = 3000, MONGO_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

async function connect() {
  try {
    await mongoose.set('strictQuery', false);
    await mongoose.connect('mongodb://127.0.0.1:27017/mestodb');
    console.log(`Установлено соединение - ${MONGO_URL}`);
    await app.listen(PORT);
    console.log(`Сервер работает на порту - ${PORT}`);
  } catch (err) {
    console.log(err);
  }
}
app.use((req, res, next) => {
  req.user = {
    _id: '5e9a19b0935bd15e549b0f7f',
  };
  next();
});

app.use(router);
connect();
