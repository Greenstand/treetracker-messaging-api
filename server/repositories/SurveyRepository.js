const BaseRepository = require('./BaseRepository');

class SurveyRepository extends BaseRepository {
  constructor(session) {
    super('survey', session);
    this._tableName = 'survey';
    this._session = session;
  }

  async getSurveyResponse(surveyId) {
    const result = await this._session.getDB().raw(
      `
        SELECT
          subject,
          survey_id,
          survey_response
        FROM
          content
        WHERE
          content.survey_id = ?
          and content.survey_response is not null
          `,
      [surveyId],
    );
    return result.rows;
  }
}

module.exports = SurveyRepository;
