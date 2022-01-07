const BaseRepository = require('./BaseRepository');

class AuthorRepository extends BaseRepository {
  constructor(session) {
    super('author', session);
    this._tableName = 'author';
    this._session = session;
  }
}

module.exports = AuthorRepository;
