const BaseRepository = require('./BaseRepository');

class SurveyQuestionRepository extends BaseRepository {
  constructor(session) {
    super('survey_question', session);
    this._tableName = 'survey_question';
    this._session = session;
  }

  async getQuestionsForSurvey(surveyId) {
    return this._session
    .getDB()(this._tableName)
    .where('survey_id', '=', surveyId)
    .orderBy('rank', 'desc');
  }

}

module.exports = SurveyQuestionRepository;
