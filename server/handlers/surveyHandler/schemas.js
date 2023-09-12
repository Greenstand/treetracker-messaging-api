const Joi = require("joi");

const surveyIdParamSchema = Joi.object({
  uuid: Joi.string().required(),
}).unknown(false);

module.exports = {
  surveyIdParamSchema,
};