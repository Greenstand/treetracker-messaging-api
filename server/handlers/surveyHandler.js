const Joi = require('joi');

const Session = require('../models/Session');
const MessageRepository = require('../repositories/MessageRepository');
const model = require("../models/Message");




const get = async (req, res, next) => {
  await Joi.object({
    uuid: Joi.string().required(),
  }).unknown(false).validateAsync(req.params, { abortEarly: false });
  const session = new Session();
  const messageRepository = new MessageRepository(session);

  try {
    const result = await model.getSurveyReport(messageRepository, req.params.uuid);
    res.status(200).send(result);
  } catch (e) {
    console.log(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    res.status(422).json({ ...e });
  }
};

module.exports = {
  get,
};
