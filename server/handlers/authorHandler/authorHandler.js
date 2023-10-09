const AuthorService = require('../../services/AuthorService');
const { authorGetQuerySchema } = require('./schemas');

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
