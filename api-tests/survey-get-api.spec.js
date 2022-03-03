require('dotenv').config();
const knex = require('../server/database/knex');
const server = require('../server/app');
const { expect } = require('chai');
const request = require('supertest');
const { v4: uuid } = require('uuid');
const jestExpect = require('expect');
const databaseCleaner = require('../database/seeds/00_job_database_cleaner');
const authorSeed = require('../database/seeds/01_table_author');
const log = require('loglevel');

describe("Survey get API", function () {

  this.beforeEach(async () => {
    await databaseCleaner.seed(knex);
    await authorSeed.seed(knex);
  });

  it.only("Get /survey/:uuid", async () => {

    // prepare the data
    const surveySeed = require('../database/seeds/12_story_survey');
    await surveySeed.seed(knex);

    // const authorId = uuid();
    // const surveyId = uuid();
    // const response1 = {
    //   "survey_response": ["My House", "10 Trees"],
    // }
    // const response2 = {
    //   "survey_response": ["My House", "11 Trees"],
    // }
    // await knex.raw(`
    //   INSERT INTO "author" (id, handle, created_at)
    //   VALUES ('${authorId}', 'handler', now()) 
    //   RETURNING id
    //   `);
    // await knex.raw(`
    //   INSERT INTO "survey" (id, title, created_at, active)
    //   VALUES ('${surveyId}', 'title', now(), true) 
    //   RETURNING id
    //   `);
    // await knex.raw(`
    //   INSERT INTO "message" (
    //     "id",
    //     "author_id",
    //     "subject",
    //     "body",
    //     "survey_id",
    //     "survey_response",
    //     "composed_at",
    //     "created_at",
    //     "active",
    //     "title"
    //   )
    //   VALUES 
    //   (
    //     uuid_generate_v4(),
    //     '${authorId}',
    //     'subject',
    //     'body',
    //     '${surveyId}',
    //     '${JSON.stringify(response1)}',
    //     now(),
    //     now(),
    //     true,
    //     'title'
    //   ),(
    //     uuid_generate_v4(),
    //     '${authorId}',
    //     'subject',
    //     'body',
    //     '${surveyId}',
    //     '${JSON.stringify(response2)}',
    //     now(),
    //     now(),
    //     true,
    //     'title'
    //   );
    //       `);

    const res = await request(server)
      .get(`/survey/${surveySeed.surveyId}`)
      .set('Accept', 'application/json')
      .expect(200);

    log.warn("res.body :", res.body);
    jestExpect(res.body).toMatchObject({
      id: surveySeed.surveyId,
      title: surveySeed.title,
      questions: [
        {
          prompt: "How many trees did you plant today?",
          choices: ['1', '10', '1000'],
        }
      ],
      responses: [
        {
          labels: ["1"],
          datasets: [{
            label: "-",
            data: [1]
          }]
        },
      ]
    });

  });

});