const BaseRepository = require('./BaseRepository');

class ContentRepository extends BaseRepository {
  constructor(session) {
    super('content', session);
    this._tableName = 'content';
    this._session = session;
  }
}

module.exports = ContentRepository;
