require('dotenv').config();
const request = require('supertest');
const jestExpect = require('expect');
const log = require('loglevel');
const databaseCleaner = require('../database/seeds/00_job_database_cleaner');
const authorSeed = require('../database/seeds/01_table_author');
const server = require('../server/app');
const knex = require('../server/database/knex');

describe('Survey get API', function () {
  this.beforeEach(async () => {
    await databaseCleaner.seed(knex);
    await authorSeed.seed(knex);
  });

  it('Get /survey/:uuid', async () => {
    // prepare the data
    const surveySeed = require('../database/seeds/12_story_survey');
    await surveySeed.seed(knex);

    const res = await request(server)
      .get(`/survey/${surveySeed.surveyId}`)
      .set('Accept', 'application/json')
      .expect(200);

    log.warn('res.body :', res.body);
    jestExpect(res.body).toMatchObject({
      id: surveySeed.surveyId,
      title: surveySeed.title,
      questions: [
        {
          prompt: 'How many trees did you plant today?',
          choices: ['1', '10', '1000'],
        },
      ],
      responses: [
        {
          labels: ['1', '10', '1000'],
          datasets: [
            {
              label: '-',
              data: [1, 1, 1],
            },
          ],
        },
      ],
    });
  });
});
