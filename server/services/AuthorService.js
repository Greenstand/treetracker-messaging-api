const Session = require('../models/Session');
const Author = require('../models/Author');

class AuthorService {
  constructor() {
    this._session = new Session();
    this._author = new Author(this._session);
  }

  async getAuthors(filter) {
    return this._author.getAuthors(filter);
  }
}

module.exports = AuthorService;
