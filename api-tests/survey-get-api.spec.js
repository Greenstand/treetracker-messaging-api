require('dotenv').config();
const knex = require('../server/database/knex');
const server = require('../server/app');
const { expect } = require('chai');
const request = require('supertest');
const { v4: uuid } = require('uuid');
const jestExpect = require('expect');

describe("Survey get API", function () {

  this.beforeEach(async () => {
    await knex.raw('TRUNCATE TABLE message, survey_question, survey, author CASCADE');
  });

  it("Get /survey/:uuid", async () => {

    // prepare the data
    const authorId = uuid();
    const surveyId = uuid();
    const response1 = {
      "survey_response": ["My House", "10 Trees"],
    }
    const response2 = {
      "survey_response": ["My House", "11 Trees"],
    }
    await knex.raw(`
      INSERT INTO "author" (id, handle, created_at)
      VALUES ('${authorId}', 'handler', now()) 
      RETURNING id
      `);
    await knex.raw(`
      INSERT INTO "survey" (id, title, created_at, active)
      VALUES ('${surveyId}', 'title', now(), true) 
      RETURNING id
      `);
    await knex.raw(`
      INSERT INTO "message" (
        "id",
        "author_id",
        "subject",
        "body",
        "survey_id",
        "survey_response",
        "composed_at",
        "created_at",
        "active",
        "title"
      )
      VALUES 
      (
        uuid_generate_v4(),
        '${authorId}',
        'subject',
        'body',
        '${surveyId}',
        '${JSON.stringify(response1)}',
        now(),
        now(),
        true,
        'title'
      ),(
        uuid_generate_v4(),
        '${authorId}',
        'subject',
        'body',
        '${surveyId}',
        '${JSON.stringify(response2)}',
        now(),
        now(),
        true,
        'title'
      );
          `);

    await request(server)
      .get(`/survey/${surveyId}`)
      .set('Accept', 'application/json')
      .expect(200)
      .then(res => {
        console.warn("res.body :", res.body);
        jestExpect(res.body).toMatchObject([
          {
            labels: ["My House"],
            datasets: [{
              label: "-",
              data: [2]
            }]
          },
          {
            labels: ["10 Trees", "11 Trees"],
            datasets: [{
              label: "-",
              data: [1, 1]
            }]
          }]);
      });

  });

});