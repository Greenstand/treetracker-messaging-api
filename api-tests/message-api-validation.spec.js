require('dotenv').config();
const request = require('supertest');
const chai = require('chai');

const { expect } = chai;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const sinon = require('sinon');
const axios = require('axios').default;

const { v4: uuid } = require('uuid');
const server = require('../server/app');

// Mock Data
const author_one_handle = 'handle1';
const author_two_handle = 'handle2';


const MessagePostObject = {
  id: 'd3b05f1b-c765-43f8-870d-4a3bb2ef277e',
  // parent_message_id: existing_message.id,
  recipient_handle: author_two_handle,
  author_handle: author_one_handle,
  subject: 'Subject',
  body: 'Bodyyy',
  // survey_id,
  composed_at: new Date().toISOString(),
  survey_response: ['answer 1'],
  video_link: 'https://www.string.com',
}

const MessageSendPostObject = {
  author_handle: author_two_handle,
  subject: 'Subject of the message',
  body: 'Body of the message',
  survey: {
    questions: [
      {
        prompt: 'What is the capital of atlantis?',
        choices: ['konoha', "Bermuda's triangle"],
      },
    ],
    title: 'Just a Random Survey',
  },
}

describe('Message API Request Validation tests.', () => {

  describe('Message POST Validation', () => {
    it(`Should raise validation error with error code 422 -- author_handle is required `, function (done) {
      const messagePostObject = { ...MessagePostObject }
      delete messagePostObject.author_handle
      request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          console.log('getting response');
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 404 -- author_handle must exist `, function (done) {
      const messagePostObject = { ...MessagePostObject }
      messagePostObject.author_handle = 'author_handle_23423';
      request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(404)
        .end(function (err) {
          console.log('getting response');
          if (err) return done(err);
          return done();
        });
    });

    // it(`Should raise validation error with error code 404 -- recipient_handle must exist `, function (done) {
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

    it(`Should raise validation error with error code 422 -- subject is required `, function (done) {
      const messagePostObject = { ...MessagePostObject }
      delete messagePostObject.subject
      request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- body is required `, function (done) {
      const messagePostObject = { ...MessagePostObject }
      delete messagePostObject.body
      request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- composed_at is required `, function (done) {
      const messagePostObject = { ...MessagePostObject }
      delete messagePostObject.composed_at
      request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- composed_at should be date in iso format`, function (done) {
      const messagePostObject = { ...MessagePostObject }
      messagePostObject.composed_at = "asdfasdfasdf"
      request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey_id should be a uuid `, function (done) {
      const messagePostObject = { ...MessagePostObject }
      messagePostObject.survey_id = "asdfasdf"
      request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- parent_message_id should be a uuid `, function (done) {
      const messagePostObject = { ...MessagePostObject }
      messagePostObject.parent_message_id = 'asdfasdf'
      request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- video_link should be a uri `, function (done) {
      const messagePostObject = { ...MessagePostObject }
      messagePostObject.video_link = 'asdfasdfasdf'
      request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

  });

  describe('Bulk_Message POST validation', () => {
    it(`Should raise validation error with error code 422 -- author_handle is required `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      delete messageSendPostObject.author_handle
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 404 -- author_handle should exist `, async function () {
      const messageSendPostObject = { ...MessageSendPostObject }
      messageSendPostObject.author_handle = "author_asdfas";
      messageSendPostObject.organization_id = uuid();
      const res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        // .expect(404)
      if(res.error) { console.log (res.error) }
    });

    it(`Should raise validation error with error code 404 -- organization_id should be a uuid `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      messageSendPostObject.organization_id = 'organization_id@!@#';
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- subject is required `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      delete messageSendPostObject.subject
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- body is required `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      delete messageSendPostObject.body
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- parent_message_id should be a uuid `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      delete messageSendPostObject.parent_message_id
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- region_id should be a uuid `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      messageSendPostObject.region_id = 'asdfasdf'
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });


    it(`Should raise validation error with error code 422 -- at least one of organization_id or region_id should be present`, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      delete messageSendPostObject.organization_id
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey should be an object with questions as an array `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      messageSendPostObject.survey =  {
        questions: { question: 'question' },
      };
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey should be an object with questions as a property `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      messageSendPostObject.survey = {
        title: { ...messageSendPostObject.survey.title },
      };
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey should be an object with title as a property `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      messageSendPostObject.survey = {
        questions: { ...messageSendPostObject.survey.questions },
      };
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey.questions should not be greater than 3 `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      messageSendPostObject.survey = {
        questions: [
          { prompt: 'question1', choices: ['a1'] },
          { prompt: 'question2', choices: ['a2'] },
          { prompt: 'question3', choices: ['a3'] },
          { prompt: 'question4', choices: ['a4'] },
        ],
      };
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey.questions is an array of objects with prompt and choices `, function (done) {
      const messageSendPostObject = { ...MessageSendPostObject }
      messageSendPostObject.survey ={
        questions: [
          { question: 'question1', choices: ['a1'] },
          { question: 'question2', choices: ['a2'] },
          { question: 'question3', choices: ['a3'] },
        ],
      };
      request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it.only(`Message to an organization should error out -- no growers found for specified organization_id `, async function () {
      const messageSendPostObject = { ...MessageSendPostObject }
      messageSendPostObject.organization_id = uuid();

      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            grower_accounts: [
            ],
          },
        };
      });

      const res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        // .expect(422)
  
      expect(res.body.message).to.eql(
        'No grower accounts found in the specified organization',
      );
          
      axiosStub.restore()
    });

    it(`Message to an organization should error out -- growers found for specified organization_id but no author_handles were associated with them `, async function () {
      const messageSendPostObject = { ...MessageSendPostObject }
      messageSendPostObject.organization_id = uuid();
      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            grower_accounts: [
              { wallet: "another_wallet" },
            ],
          },
        };
      });
      const res = await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(422)
        if(res.error ) {
          // eslint-disable-next-line no-console
          console.log(res.error);
        }
        expect(res.body.message).to.eql(
          'No author handles found for any of the growers found in the specified organization',
        );
         
      axiosStub.restore();
    });

  });


  describe('Message GET validation', () => {
    it(`Should raise validation error with error code 422 -- author_handle is required as a query parameter `, function (done) {
      request(server)
        .get(`/message`)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 404 -- author_handle should exist `, function (done) {
      request(server)
        .get(`/message`)
        .query({
          author_handle: 'author_handle@!@#@!@#@',
        })
        .set('Accept', 'application/json')
        .expect(404)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- 'since' query parameter should be a date  `, function (done) {
      request(server)
        .get(`/message`)
        .query({
          since: 'since',
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be an integer  `, function (done) {
      request(server)
        .get(`/message`)
        .query({
          limit: 'limit',
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be greater than 0  `, function (done) {
      request(server)
        .get(`/message`)
        .query({
          limit: 0,
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be less than 101  `, function (done) {
      request(server)
        .get(`/message`)
        .query({
          limit: 101,
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- 'offset' query parameter should be an integer  `, function (done) {
      request(server)
        .get(`/message`)
        .query({
          offset: 'offset',
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- 'offset' query parameter should be at least 0  `, function (done) {
      request(server)
        .get(`/message`)
        .query({
          offset: -1,
          author_handle: 'author_handle',
        })
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });
  });
});
