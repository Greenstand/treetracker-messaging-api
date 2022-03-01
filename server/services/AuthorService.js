const Session = require('../models/Session');
const Author = require('../models/Author');


const getAuthors = async (filter) => {
  const session = new Session();
  return Author.getAuthors(session, filter);
}

module.exports = {
  getAuthors
}