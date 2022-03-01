const Joi = require('joi');

const log = require('loglevel');
const Session = require('../models/Session');
const SurveyRepository = require('../repositories/SurveyRepository');
const SurveyQuestionRepository = require('../repositories/SurveyQuestionRepository');
const model = require('../models/Survey');

const get = async (req, res, next) => {
  await Joi.object({
    uuid: Joi.string().required(),
  }).unknown(false).validateAsync(req.params, { abortEarly: false });
  const session = new Session();
  const surveyRepository = new SurveyRepository(session);
  const surveyQuestionRepository = new SurveyQuestionRepository(session);

  try {
    const result = await model.getSurveyReport(
      surveyRepository, 
      surveyQuestionRepository, 
      req.params.uuid);
    res.status(200).send(result);
  } catch (e) {
    log.log(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    res.status(422).json({ ...e });
  }
};

module.exports = {
  get,
};
