const SurveyRepository = require('../repositories/SurveyRepository');
const SurveyQuestionRepository = require('../repositories/SurveyQuestionRepository');

class Survey {
  constructor(session) {
    this._surveyRepository = new SurveyRepository(session);
    this._surveyQuestionRepository = new SurveyQuestionRepository(session);
  }

  static SurveyQuestionObject({ rank, prompt, choices, survey_id }) {
    return Object.freeze({
      survey_id,
      rank,
      prompt,
      choices,
    });
  }

  async createSurvey(body) {
    const survey = await this._surveyRepository.create({ title: body.title });

    let rank = 1;
    await Promise.all(
      body.questions.map(async (question) => {
        const { prompt, choices } = question;
        const surveyQuestionObject = this.constructor.SurveyQuestionObject({
          survey_id: survey.id,
          prompt,
          choices,
          rank,
        });
        rank += 1;
        await this._surveyQuestionRepository.create(surveyQuestionObject);
      }),
    );
    return survey;
  }

  async getSurveyReport(surveyId) {
    const surveyResponses = await this._surveyRepository.getSurveyResponse(
      surveyId,
    );
    const survey = await this._surveyRepository.getById(surveyId);
    const questions =
      await this._surveyQuestionRepository.getQuestionsForSurvey(surveyId);
    const responses = surveyResponses
      .reduce((a, c) => {
        const aa = a;

        for (let i = 0; i < c.survey_response.survey_response.length; i += 1) {
          const e = c.survey_response.survey_response[i];
          if (aa[i] === undefined) {
            aa[i] = {};
          }
          if (aa[i][e] === undefined) {
            aa[i][e] = 0;
          }
          aa[i][e] += 1;
        }
        return aa;
      }, [])
      .map((counter) => {
        return {
          labels: [...Object.keys(counter)],
          datasets: [
            {
              label: '-',
              data: [...Object.values(counter)],
            },
          ],
        };
      });

    const result = {
      ...survey,
      questions,
      responses,
    };

    return result;
  }
}

module.exports = Survey;
