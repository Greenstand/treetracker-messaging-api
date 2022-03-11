require('dotenv').config();
const { v4: uuid } = require('uuid');
const chai = require('chai');

const { expect } = chai;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const sinon = require('sinon');
const axios = require('axios').default;

const request = require('./lib/supertest');
const server = require('../server/app');

// Mock Data
const author_one_handle = 'handle1';
const author_two_handle = 'handle2';

const MessagePostObject = {
  // id: 'd3b05f1b-c765-43f8-870d-4a3bb2ef277e',
  // parent_message_id: existing_message.id,
  recipient_handle: author_two_handle,
  author_handle: author_one_handle,
  body: 'Bodyyy',
  type: 'message',
  // survey_id,
  // composed_at: new Date().toISOString(),
  survey_response: ['answer 1'],
  video_link: 'https://www.string.com',
};

const MessageSendPostObject = {
  author_handle: author_two_handle,
  subject: 'Subject of the message',
  body: 'Body of the message',
  type: 'survey',
  survey: {
    questions: [
      {
        prompt: 'What is the capital of atlantis?',
        choices: ['konoha', "Bermuda's triangle"],
      },
    ],
    title: 'Just a Random Survey',
  },
};

describe('Message API Request Validation tests.', () => {
  describe('Message POST Validation', () => {
    it(`Should raise validation error with error code 422 -- author_handle is required `, async () => {
      const messagePostObject = { ...MessagePostObject };
      delete messagePostObject.author_handle;
      const _res = await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 404 -- author_handle must exist `, async () => {
      const messagePostObject = { ...MessagePostObject };
      messagePostObject.author_handle = 'author_handle_23423';
      const _res = await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(404);
    });

    // it(`Should raise validation error with error code 404 -- recipient_handle must exist `, async () => {
    //   const messagePostObject = { ...MessagePostObject }
    //   messagePostObject.recipient_handle = 'recipient_handle_@!@#';
    //   request(server)
    //     .post(`/message`)
    //     .send(messagePostObject)
    //     .set('Accept', 'application/json')
    //     .expect(404)
    //     .end(function (err) {
    //       console.log('getting response');
    //       if (err) return done(err);
    //       return done();
    //     });
    // });

    it(`Should raise validation error with error code 422 -- body is required for regular message`, async () => {
      const messagePostObject = { ...MessagePostObject };
      delete messagePostObject.body;
      const _res = await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- type is required `, async () => {
      const messagePostObject = { ...MessagePostObject };
      delete messagePostObject.type;
      const _res = await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it.skip(`Should raise validation error with error code 422 -- composed_at is required `, async () => {
      const messagePostObject = { ...MessagePostObject };
      delete messagePostObject.composed_at;
      const _res = await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it.skip(`Should raise validation error with error code 422 -- composed_at should be date in iso format`, async () => {
      const messagePostObject = { ...MessagePostObject };
      messagePostObject.composed_at = 'asdfasdfasdf';
      const _res = await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- survey_id should be a uuid `, async () => {
      const messagePostObject = { ...MessagePostObject };
      messagePostObject.survey_id = 'asdfasdf';
      const _res = await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- parent_message_id should be a uuid `, async () => {
      const messagePostObject = { ...MessagePostObject };
      messagePostObject.parent_message_id = 'asdfasdf';
      const _res = await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- video_link should be a uri `, async () => {
      const messagePostObject = { ...MessagePostObject };
      messagePostObject.video_link = 'asdfasdfasdf';
      const _res = await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });
  });

  describe('Bulk_Message POST validation', () => {
    it(`Should raise validation error with error code 422 -- author_handle is required `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      delete messageSendPostObject.author_handle;
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- author_handle should exist `, async function () {
      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            growerAccounts: [{ handle: 'another_wallet' }],
          },
        };
      });

      const messageSendPostObject = { ...MessageSendPostObject };
      messageSendPostObject.author_handle = 'author_asdfas';
      messageSendPostObject.organization_id = uuid();
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);

      axiosStub.restore();
    });

    it(`Should raise validation error with error code 404 -- organization_id should be a uuid `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      messageSendPostObject.organization_id = 'organization_id@!@#';
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- subject is required `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      delete messageSendPostObject.subject;
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- body is required `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      delete messageSendPostObject.body;
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- parent_message_id should be a uuid `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      delete messageSendPostObject.parent_message_id;
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- region_id should be a uuid `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      messageSendPostObject.region_id = 'asdfasdf';
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- at least one of organization_id or region_id should be present`, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      delete messageSendPostObject.organization_id;
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- survey should be an object with questions as an array `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      messageSendPostObject.survey = {
        questions: { question: 'question' },
      };
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- survey should be an object with questions as a property `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      messageSendPostObject.survey = {
        title: { ...messageSendPostObject.survey.title },
      };
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- survey should be an object with title as a property `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      messageSendPostObject.survey = {
        questions: { ...messageSendPostObject.survey.questions },
      };
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- survey.questions should not be greater than 3 `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      messageSendPostObject.survey = {
        questions: [
          { prompt: 'question1', choices: ['a1'] },
          { prompt: 'question2', choices: ['a2'] },
          { prompt: 'question3', choices: ['a3'] },
          { prompt: 'question4', choices: ['a4'] },
        ],
      };
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- survey.questions is an array of objects with prompt and choices `, async () => {
      const messageSendPostObject = { ...MessageSendPostObject };
      messageSendPostObject.survey = {
        questions: [
          { question: 'question1', choices: ['a1'] },
          { question: 'question2', choices: ['a2'] },
          { question: 'question3', choices: ['a3'] },
        ],
      };
      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Message to an organization should error out -- no growers found for specified organization_id `, async function () {
      const messageSendPostObject = { ...MessageSendPostObject };
      messageSendPostObject.organization_id = uuid();

      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            growerAccounts: [],
          },
        };
      });

      const _res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json');
      // .expect(422)

      expect(_res.body.message).to.eql(
        'No author handle found in the specified organization',
      );

      axiosStub.restore();
    });
  });

  describe('Message GET validation', () => {
    it(`Should raise validation error with error code 422 -- author_handle is required as a query parameter `, async () => {
      const _res = await request(server)
        .get(`/message`)
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 404 -- author_handle should exist `, async () => {
      const _res = await request(server)
        .get(`/message`)
        .query({
          handle: 'author_handle@!@#@!@#@',
        })
        .set('Accept', 'application/json')
        .expect(404);
    });

    it(`Should raise validation error with error code 422 -- 'since' query parameter should be a date  `, async () => {
      const _res = await request(server)
        .get(`/message`)
        .query({
          since: 'since',
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be an integer  `, async () => {
      const _res = await request(server)
        .get(`/message`)
        .query({
          limit: 'limit',
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be greater than 0  `, async () => {
      const _res = await request(server)
        .get(`/message`)
        .query({
          limit: 0,
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be less than 501  `, async () => {
      const _res = await request(server)
        .get(`/message`)
        .query({
          limit: 501,
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- 'offset' query parameter should be an integer  `, async () => {
      const _res = await request(server)
        .get(`/message`)
        .query({
          offset: 'offset',
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422);
    });

    it(`Should raise validation error with error code 422 -- 'offset' query parameter should be at least 0  `, async () => {
      const _res = await request(server)
        .get(`/message`)
        .query({
          offset: -1,
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422);
    });
  });
});
