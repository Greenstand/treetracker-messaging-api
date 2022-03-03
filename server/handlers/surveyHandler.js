const Joi = require('joi');

const log = require('loglevel');
const { getSurveyReport } = require('../services/SurveyService');

const get = async (req, res) => {
  await Joi.object({
    uuid: Joi.string().required(),
  }).unknown(false).validateAsync(req.params, { abortEarly: false });

  try {
    const result = await getSurveyReport(req.params.uuid);
    res.status(200).send(result);
  } catch (e) {
    log.log(e);
    res.status(422).json({ ...e });
  }
};

module.exports = {
  get,
};
