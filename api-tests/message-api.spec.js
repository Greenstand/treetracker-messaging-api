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

describe('Message API tests.', () => {

  before(async function () {
    await knex.raw(`
    DELETE FROM message_request;
    DELETE FROM message;
    DELETE FROM content;
    DELETE FROM author;
    DELETE FROM survey_question;
    DELETE FROM survey;
    `);

    await knex.raw(`
    INSERT INTO author(
	    id, handle, created_at)
	  VALUES 
        ('${author_one_id}', '${author_one_handle}', now()),
        ('${author_two_id}', '${author_two_handle}', now()),
        ('${author_three_id}', '${author_three_handle}', now()),
        ('${author_four_id}', '${author_four_handle}', now());
        `);

  });


  describe('Message POST Resource Creation', () => {

    it(`Should create a message `, async function () {
      const messagePostObject = {
        recipient_handle: author_two_handle,
        author_handle: author_one_handle,
        subject: uuid(),
        body: 'Bodyyy',
        composed_at: new Date().toISOString(),
      }
      console.log(messagePostObject);
      await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(204);

      const content = await knex
        .select('*')
        .table('content')
        .where('subject', messagePostObject.subject);

      expect(content).have.lengthOf(1);

      const message = await knex
        .table('message')
        .select('id')
        .where('content_id', content[0].id);
      expect(message).have.lengthOf(1);

    });

    it(`Should respond to an existing message `, async function () {

      const messagePostObject = {
        recipient_handle: author_two_handle,
        author_handle: author_one_handle,
        subject: uuid(),
        body: 'Body',
        composed_at: new Date().toISOString(),
      }
      await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(204);

      const message = await knex
        .select(['message.id as message_id', '*'])
        .table('message')
        .join('content', 'message.content_id', '=', 'content.id')
        .where('subject', messagePostObject.subject);

      const messageReplyObject = {
        recipient_handle: author_one_handle,
        author_handle: author_two_handle,
        parent_message_id: message[0].message_id,
        subject: uuid(),
        body: 'Body',
        composed_at: new Date().toISOString(),
        video_link: 'https://www.string.com',
      }

      await request(server)
        .post(`/message`)
        .send(messageReplyObject)
        .set('Accept', 'application/json')
        .expect(204);

      const messageReply = await knex
        .select(['message.id as message_id', '*'])
        .table('message')
        .join('content', 'message.content_id', '=', 'content.id')
        .where('subject', messageReplyObject.subject);
      expect(messageReply).have.lengthOf(1);
      expect(messageReply[0].parent_message_id).to.equal(message[0].message_id);

    });

    it(`Should send a regular message and pass tests using API `, async function () {

      // const messagePostObject = {
      //   recipient_handle: author_two_handle,
      //   author_handle: author_one_handle,
      //   subject: uuid(),
      //   body: 'Bodyyy',
      //   composed_at: new Date().toISOString(),
      // }
      // console.log(messagePostObject);
      // await request(server)
      //   .post(`/message`)
      //   .send(messagePostObject)
      //   .set('Accept', 'application/json')
      //   .expect(204);

      const messagePostObject = {
        recipient_handle: author_one_handle,
        author_handle: author_two_handle,
        subject: uuid(),
        body: 'Check in to get your trees',
        composed_at: new Date().toISOString()
      }
      await request(server)
      .post(`/message`)
      .send(messagePostObject)
      .set('Accept', 'application/json')
      .expect(204);

      const res = await request(server)
        .get(`/message`)
        .query({
          author_handle: author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      console.log(res.body.messages);
      expect(res.body.messages).to.be.an('array')
        .that.contains.something.like({subject: messagePostObject.subject, from: author_two_handle, to: author_one_handle});

      const res2 = await request(server)
        .get(`/message`)
        .query({
          author_handle: author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      console.log(res2.body.messages);
      expect(res2.body.messages).to.be.an('array')
        .that.contains.something.like({subject: messagePostObject.subject, from: author_two_handle, to: author_one_handle})

    });

    it.skip(`Should respond to a survey`, async function () {

    });

    it.skip(`Should respond to an announce message`, async function () {

    });
  });


  describe.skip('Message/Send POST resource creation', () => {

    it(`Should send an announce message to an organization`, async function () {
      const messageSendPostObject = {
        author_handle: author_one_handle,
        subject: uuid(),
        body: 'This is an announcement to come pick up some trees',
        organization_id
      }

      axiosStub = sinon.stub(axios, 'get').callsFake(async (url) => {
        return {
          data: {
            growers: [
              { wallet: author_two_handle },
            ],
          },
        };
      });

      await request(server)
        .post(`/message/send`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);

      axiosStub.restore();

      const res = await request(server)
        .get(`/message`)
        .query({
          author_handle: author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      console.log(res.body.messages);
      expect(res.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: author_one_handle, to: null });

      const res2 = await request(server)
        .get(`/message`)
        .query({
          author_handle: author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      console.log(res2.body.messages);
      expect(res2.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: author_one_handle, to: author_two_handle })
    });

    it(`Should send an announce message to multiple recipients in an organization`, async function () {
      const messageSendPostObject = {
        author_handle: author_one_handle,
        subject: uuid(),
        body: 'This is an announcement to come pick up some trees',
        organization_id
      }

      axiosStub = sinon.stub(axios, 'get').callsFake(async (url) => {
        return {
          data: {
            growers: [
              { wallet: author_two_handle },
              { wallet: author_three_handle },
              { wallet: author_four_handle }
            ],
          },
        };
      });

      await request(server)
        .post(`/message/send`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);

      axiosStub.restore();

      const res = await request(server)
        .get(`/message`)
        .query({
          author_handle: author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      console.log(res.body.messages);
      expect(res.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: author_one_handle, to: null });

      const res2 = await request(server)
        .get(`/message`)
        .query({
          author_handle: author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      console.log(res2.body.messages);
      expect(res2.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: author_one_handle, to: author_two_handle })

      const res3 = await request(server)
        .get(`/message`)
        .query({
          author_handle: author_three_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      console.log(res3.body.messages);
      expect(res3.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: author_one_handle, to: author_three_handle })

      const res4 = await request(server)
        .get(`/message`)
        .query({
          author_handle: author_four_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      console.log(res4.body.messages);
      expect(res4.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: author_one_handle, to: author_four_handle })
    });


    it(`Should send a survey message`, async function () {
      const messageSendPostObject = {
        author_handle: author_one_handle,
        subject: uuid(),
        body: 'This is an announcement to come pick up some trees',
        organization_id,
        survey: {
          questions: [
            {
              prompt: 'What is the capital of atlantis?',
              choices: ['konoha', "Bermuda's triangle"],
            },
          ],
          title: uuid(),
        },
      }

      axiosStub = sinon.stub(axios, 'get').callsFake(async (url) => {
        return {
          data: {
            growers: [
              { wallet: author_two_handle },
            ],
          },
        };
      });

      await request(server)
        .post(`/message/send`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);

      axiosStub.restore();

      const res = await request(server)
        .get(`/message`)
        .query({
          author_handle: author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)

      console.log(res.body.messages);
      expect(res.body.messages).to.be.an('array')
        .that.contains.something.like({ from: author_one_handle, to: null, survey: { title: messageSendPostObject.survey.title } });
    });

    it(`Send a survey message and recipient should recieve it`, async function () {
      const messageSendPostObject = {
        author_handle: author_one_handle,
        subject: uuid(),
        body: 'This is an announcement to come pick up some trees',
        organization_id,
        survey: {
          questions: [
            {
              prompt: 'What is the capital of atlantis?',
              choices: ['konoha', "Bermuda's triangle"],
            },
          ],
          title: uuid(),
        },
      }

      axiosStub = sinon.stub(axios, 'get').callsFake(async (url) => {
        return {
          data: {
            growers: [
              { wallet: author_two_handle },
            ],
          },
        };
      });

      await request(server)
        .post(`/message/send`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);

      axiosStub.restore();

      const res = await request(server)
        .get(`/message`)
        .query({
          author_handle: author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)

      console.log(res.body.messages);
      expect(res.body.messages).to.be.an('array')
        .that.contains.something.like({ from: author_one_handle, to: author_two_handle, survey: { title: messageSendPostObject.survey.title } });
        
    });
  });

  

  describe.skip('Message GET', () => {
    it(`Should get messages successfully`, function (done) {
      request(server)
        .get(`/message`)
        .query({
          author_handle: author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          expect(res.body).to.have.keys(['messages', 'links']);
          expect(res.body.links).to.have.keys(['prev', 'next']);

          // test if surveys were added successfully
          // TODO: do not check for data inserted by previous tests
          // TODO: tests should be atomic, not interdependent.
          const messageSendPostObject = new MessageSendPostObject();

          let survey_one_exists = false;
          let survey_two_exists = false;
          for (const message of res.body.messages) {
            expect(message).to.have.keys([
              'id',
              'parent_message_id',
              'from',
              'to',
              'subject',
              'body',
              'composed_at',
              'video_link',
              'survey',
            ]);
            if (message.survey) {
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
              console.log(survey.title);
              console.log(res.body.messages.length);
              if (survey.title === survey_title) survey_two_exists = true;
            }
            expect(message.to).to.have.length(1);
            expect(message.to[0]).to.have.keys(['recipient', 'type']);
            expect(message.from).to.have.keys(['author', 'type']);
          }

          expect(survey_one_exists).to.be.true;
          // expect(survey_two_exists).to.be.true;

          return done();
        });
    });

    it.skip('Get message by id', function (done) {
      const messagePostObject = new MessagePostObject();
      const messageId = messagePostObject._object.id;
      request(server)
        .get(`/message/${messageId}`)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body.id === messageId).to.equal(true);
          return done();
        });
    });
  });
});
