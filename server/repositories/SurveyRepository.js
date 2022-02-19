const BaseRepository = require('./BaseRepository');

class SurveyRepository extends BaseRepository {
  constructor(session) {
    super('survey', session);
    this._tableName = 'survey';
    this._session = session;
  }
}

module.exports = SurveyRepository;
