require('dotenv').config();
const request = require('supertest');
const { expect } = require('chai');
const server = require('../server/app');
const knex = require('../server/database/knex');
const { message_delivery_id, survey_title } = require('./seed-data-creation');
const { author_one_handle } = require('./generic-class');
const MessagePostObject = require('./message-post-class');
const MessageSendPostObject = require('./message-send-post-class');

describe('Message API tests.', () => {
  describe('Message POST', () => {
    it(`Should raise validation error with error code 422 -- author_handle is required `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.delete_property('author_handle');
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

    it(`Should raise validation error with error code 404 -- author_handle should exist `, function (done) {
      const messagePostObject = new MessagePostObject();
      messagePostObject.change_property('author_handle', 'author_handle_@!@#');
      request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(404)
        .end(function (err) {
          if (err) return done(err);
          return done();
        });
    });

    it(`Should raise validation error with error code 404 -- recipient_handle should exist `, function (done) {
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

    it(`Should be successful `, async function () {
      const messagePostObject = new MessagePostObject();
      await request(server)
        .post(`/message`)
        .send(messagePostObject._object)
        .set('Accept', 'application/json')
        .expect(200);
      const message_delivery = await knex
        .table('message_delivery')
        .select('id')
        .where('parent_message_id', message_delivery_id);

      const message_request = await knex
        .select('id')
        .table('message_request')
        .where('author_handle', messagePostObject._object.author_handle);

      const message = await knex
        .select('id')
        .table('message')
        .where('subject', messagePostObject._object.subject)
        .where('body', messagePostObject._object.body)
        .where('composed_at', messagePostObject._object.composed_at)
        .where('survey_response', {
          survey_response: messagePostObject._object.survey_response,
        })
        .where('video_link', messagePostObject._object.video_link);

      expect(message).have.lengthOf(1);
      expect(message_delivery).have.lengthOf(1);
      expect(message_request).have.lengthOf(1);
    });
  });

  describe('Message/Send POST', () => {
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

    it(`Should raise validation error with error code 404 -- organization_id should be an integer `, function (done) {
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

    it(`Should raise validation error with error code 422 -- only one of region_id, recipient_handle or organization_id should be allowed`, function (done) {
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

    it(`Should be successful `, async function () {
      const messageSendPostObject = new MessageSendPostObject();
      await request(server)
        .post(`/message/send`)
        .send(messageSendPostObject._object)
        .set('Accept', 'application/json')
        .expect(200);
      const message_delivery = await knex
        .table('message_delivery')
        .select('id')
        .where('parent_message_id', message_delivery_id);

      const message_request = await knex
        .select('id')
        .table('message_request')
        .where('author_handle', messageSendPostObject._object.author_handle);

      const message = await knex
        .select('id')
        .table('message')
        .where('subject', messageSendPostObject._object.subject)
        .where('body', messageSendPostObject._object.body);

      const survey = await knex
        .select('id')
        .table('survey')
        .where('title', messageSendPostObject._object.survey.title);

      expect(message).have.lengthOf(1);
      expect(survey).have.lengthOf(1);
      expect(message_delivery).have.lengthOf(2);
      expect(message_request).have.lengthOf(1);
    });
  });

  describe('Message GET', () => {
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

    it(`Should get messages successfully`, function (done) {
      request(server)
        .get(`/message`)
        .query({
          author_handle: author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.keys(['messages', 'links']);
          expect(res.body.links).to.have.keys(['prev', 'next']);

          // test if surveys were added successfully
          const messageSendPostObject = new MessageSendPostObject();

          let survey_one_exists = false;
          let survey_two_exists = false;
          for (const message of res.body.messages) {
            expect(message).to.have.keys([
              'parent_message_id',
              'from',
              'to',
              'subject',
              'body',
              'composed_at',
              'video_link',
              'survey',
            ]);
            expect(message.survey).to.have.keys([
              'id',
              'title',
              'questions',
              'response',
              'answers',
            ]);
            const { survey } = message;
            if (survey.title === messageSendPostObject._object.survey.title) {
              survey_one_exists = true;
              expect(survey.questions).eql(
                messageSendPostObject._object.survey.questions,
              );
            }
            if (survey.title === survey_title) survey_two_exists = true;
          }

          expect(survey_one_exists).to.be.true;
          expect(survey_two_exists).to.be.true;

          return done();
        });
    });
  });
});
