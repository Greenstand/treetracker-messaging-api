const Joi = require('joi');

const log = require('loglevel');
const SurveyService = require('../services/SurveyService');

const surveyIdParamSchema = Joi.object({
  uuid: Joi.string().required(),
}).unknown(false);

const surveyGet = async (req, res) => {
  await surveyIdParamSchema.validateAsync(req.params, { abortEarly: false });

  try {
    const surveyService = new SurveyService();
    const result = await surveyService.getSurveyReport(req.params.uuid);
    res.status(200).send(result);
  } catch (e) {
    log.log(e);
    res.status(422).json({ ...e });
  }
};

module.exports = {
  surveyGet,
};
