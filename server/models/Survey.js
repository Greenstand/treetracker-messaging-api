const { v4: uuid } = require('uuid');

const SurveyRepository = require('../repositories/SurveyRepository');
const SurveyQuestionRepository = require('../repositories/SurveyQuestionRepository');

const SurveyObject = (survey) =>
  Object.freeze({
    id: uuid(),
    title: survey.title,
    created_at: new Date().toISOString(),
    active: true,
  });

const SurveyQuestionObject = ({ rank, prompt, choices, survey_id }) =>
  Object.freeze({
    id: uuid(),
    survey_id,
    rank,
    prompt,
    choices,
    created_at: new Date().toISOString(),
  });

const createSurvey = async (session, body) => {
  const surveyRepo = new SurveyRepository(session);
  const surveyQuesetionRepo = new SurveyQuestionRepository(session);

  const surveyObject = SurveyObject(body);
  const survey = await surveyRepo.create(surveyObject);

  let rank = 1;
  await Promise.all(body.questions.map(async (question) => {
    const { prompt, choices } = question;
    const surveyQuestionObject = SurveyQuestionObject({
      survey_id: survey.id,
      prompt,
      choices,
      rank,
    });
    rank += 1;
    await surveyQuesetionRepo.create(surveyQuestionObject);
  }));
  return survey;
};

module.exports = {
  createSurvey,
};
