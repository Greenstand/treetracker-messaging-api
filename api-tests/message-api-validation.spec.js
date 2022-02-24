require('dotenv').config();
const request = require('supertest');
const chai = require('chai');

  const {expect} = chai;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const sinon = require('sinon');
const axios = require('axios').default;

const { v4: uuid } = require('uuid');
const server = require('../server/app');
const knex = require('../server/database/knex');

// Mock Data
const author_one_id = uuid();
const author_two_id = uuid();
const author_three_id = uuid();
const author_four_id = uuid();
const author_one_handle = 'handle1';
const author_two_handle = 'handle2';
const author_three_handle = 'handle3';
const author_four_handle = 'handle4';

const {
  organization_id,
  organization_id_two,
  existing_message,
} = require('./generic-class');

const MessagePostObject = require('./message-post-class');
const MessageSendPostObject = require('./message-send-post-class');

describe('Message API Request Validation tests.', () => {

  describe('Message POST Validation', () => {
    it(`Should raise validation error with error code 422 -- author_handle is required `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.delete_property('author_handle');
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          console.log('getting response');
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 404 -- author_handle must exist `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.change_property('author_handle', 'author_handle_23423');
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(404)
        .end(function (err) {
          console.log('getting response');
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 404 -- recipient_handle must exist `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.change_property(
        'recipient_handle',
        'recipient_handle_@!@#',
      );
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(404)
        .end(function (err) {
          console.log('getting response');
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- subject is required `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.delete_property('subject');
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- body is required `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.delete_property('body');
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- composed_at is required `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.delete_property('composed_at');
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- composed_at should be date in iso format`, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.change_property('composed_at', 'composed_at');
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey_id should be a uuid `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.change_property('survey_id', 'survey_id');
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- parent_message_id should be a uuid `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.change_property(
        'parent_message_id',
        'parent_message_id',
      );
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- video_link should be a uri `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.change_property('video_link', 'video_link');
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

  });

  describe('Message/Send POST validation', () => {
    it(`Should raise validation error with error code 422 -- author_handle is required `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.delete_property('author_handle');
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 404 -- author_handle should exist `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.change_property(
        'author_handle',
        'author_handle_@!@#',
      );
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(404)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 404 -- recipient_handle should exist `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.change_property(
        'recipient_handle',
        'recipient_handle_@!@#',
      );
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(404)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 404 -- organization_id should be a uuid `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.delete_property('recipient_handle');
      messageSendPostObject.change_property(
        'organization_id',
        'organization_id@!@#',
      );
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- subject is required `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.delete_property('subject');
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- body is required `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.delete_property('body');
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- parent_message_id should be a uuid `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.change_property(
        'parent_message_id',
        'parent_message_id',
      );
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- region_id should be a uuid `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.delete_property('recipient_handle');
      messageSendPostObject.change_property('region_id', 'region_id');
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- only one of recipient_handle or organization_id should be allowed`, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.change_property('organization_id', 41258);
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- only one of recipient_handle or region_id should be allowed`, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.change_property('region_id', uuid());
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- at least one of organization_id, recipient_handle or region_id should be present`, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.delete_property('recipient_handle');
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey should be an object with questions as an array `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.change_property('survey', {
        questions: { question: 'question' },
      });
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey should be an object with questions as a property `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.change_property('survey', {
        title: { ...messageSendPostObject._object.survey.title },
      });
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey should be an object with title as a property `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.change_property('survey', {
        questions: { ...messageSendPostObject._object.survey.questions },
      });
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey.questions should not be greater than 3 `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.change_property('survey', {
        questions: [
          { prompt: 'question1', choices: ['a1'] },
          { prompt: 'question2', choices: ['a2'] },
          { prompt: 'question3', choices: ['a3'] },
          { prompt: 'question4', choices: ['a4'] },
        ],
      });
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 422 -- survey.questions is an array of objects with prompt and choices `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.change_property('survey', {
        questions: [
          { question: 'question1', choices: ['a1'] },
          { question: 'question2', choices: ['a2'] },
          { question: 'question3', choices: ['a3'] },
        ],
      });
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Message to an organization should error out -- no ground users found for specified organization_id `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.delete_property('recipient_handle');
      messageSendPostObject.change_property('organization_id', uuid());
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.message).to.eql(
            'No ground users found in the specified organization',
          );
          return done();
        });
    });

    it(`Message to an organization should error out -- ground users found for specified organization_id but no author_handles were associated with them `, function (done) {
      const messageSendPostObject = new MessageSendPostObject();
      messageSendPostObject.delete_property('recipient_handle');
      messageSendPostObject.change_property(
        'organization_id',
        organization_id_two,
      );
      request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(422)
        .end(function (err, res) {
          console.log(res);
          if (err) return done(err);
          expect(res.body.message).to.eql(
            'No author handles found for any of the ground users found in the specified organization',
          );
          return done();
        });
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
