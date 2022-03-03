const log = require('loglevel');
const Session = require('../models/Session');
const Survey = require('../models/Survey');
const SurveyRepository = require('../repositories/SurveyRepository');
const SurveyQuestionRepository = require('../repositories/SurveyQuestionRepository');

const getSurveyReport = async (surveyId) => {
  log.debug("getSurveyReport");
  const session = new Session();
  const surveyRepository = new SurveyRepository(session);
  const surveyQuestionRepository = new SurveyQuestionRepository(session);

  const result = await Survey.getSurveyReport(
    surveyRepository,
    surveyQuestionRepository,
    surveyId,
  );
  return result;
};

module.exports = {
  getSurveyReport,
};
