const Card = require('../models/card');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const CurrentErr = require('../errors/CurrentErr');

const createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const card = await Card.create({ name, link, owner: req.user._id });

    res.status(201).send(card);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequest('Переданы некорректные данные при создании карточки.'));
    } else {
      next(err);
    }
  }
};

const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});

    res.send(cards);
  } catch (err) {
    next(err);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      throw new NotFound('Карточка не найдена');
    }

    if (card.owner.toString() !== req.user._id) {
      throw new CurrentErr('Вы не можете удалить чужую карточку');
    }

    await Card.findByIdAndDelete(req.params.id);

    res.send(card);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequest('Переданы некорректные данные'));
    } else {
      next(err);
    }
  }
};

const handleCardLike = async (req, res, next) => {
  try {
    let action;

    if (req.method === 'PUT') {
      action = '$addToSet';
    }

    if (req.method === 'DELETE') {
      action = '$pull';
    }

    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { [action]: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      throw new NotFound('Передан несуществующий _id карточки');
    }

    res.send(card);
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequest('Переданы некорректные данные для постановки/снятии лайка'));
    } else {
      next(err);
    }
  }
};

module.exports = {
  createCard,
  getCards,
  deleteCard,
  handleCardLike,
};
