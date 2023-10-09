const Joi = require("joi");

const authorGetQuerySchema = Joi.object({
  id: Joi.string().uuid(),
}).unknown(false);

module.exports = {
  authorGetQuerySchema,
};