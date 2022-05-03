const log = require('loglevel');
const Session = require('../models/Session');
const Survey = require('../models/Survey');

class SurveyService {
  constructor() {
    this._session = new Session();
    this._survey = new Survey(this._session);
  }

  async getSurveyReport(surveyId) {
    log.debug('getSurveyReport');

    const result = await this._survey.getSurveyReport(surveyId);
    return result;
  }
}

module.exports = SurveyService;
