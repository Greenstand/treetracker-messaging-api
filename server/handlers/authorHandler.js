const Joi = require('joi');

const AuthorService = require('../services/AuthorService');

const authorGetQuerySchema = Joi.object({
  id: Joi.string().uuid(),
}).unknown(false);

const authorGet = async (req, res) => {
  await authorGetQuerySchema.validateAsync(req.query, { abortEarly: false });
  const authorService = new AuthorService();
  const result = await authorService.getAuthors(req.query);
  res.send(result);
  res.end();
};

module.exports = {
  authorGet,
};
