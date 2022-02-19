const BaseRepository = require('./BaseRepository');

class SurveyQuestionRepository extends BaseRepository {
  constructor(session) {
    super('survey_question', session);
    this._tableName = 'survey_question';
    this._session = session;
  }
}

module.exports = SurveyQuestionRepository;
