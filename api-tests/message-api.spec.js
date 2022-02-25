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

const databaseCleaner = require('../database/seeds/00_job_database_cleaner');
const authorSeed = require('../database/seeds/01_table_author');


const {
  organization_id,
} = require('./generic-class');

const MessagePostObject = require('./message-post-class');
const MessageSendPostObject = require('./message-send-post-class');

describe('Message API tests.', () => {

  before(async function () {

    databaseCleaner.seed();
    authorSeed.seed();
      
  });


  describe('Message POST Resource Creation', () => {

    it(`Should create a message `, async function () {
      const messagePostObject = {
        recipient_handle: authorSeed.author_two_handle,
        author_handle: authorSeed.author_one_handle,
        subject: uuid(),
        body: 'Bodyyy',
        composed_at: new Date().toISOString(),
      }
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
        recipient_handle: authorSeed.author_two_handle,
        author_handle: authorSeed.author_one_handle,
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
        recipient_handle: authorSeed.author_one_handle,
        author_handle: authorSeed.author_two_handle,
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

      const messagePostObject = {
        recipient_handle: authorSeed.author_one_handle,
        author_handle: authorSeed.author_two_handle,
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
          author_handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      expect(res.body.messages).to.be.an('array')
        .that.contains.something.like({subject: messagePostObject.subject, from: authorSeed.author_two_handle, to: authorSeed.author_one_handle});

      const res2 = await request(server)
        .get(`/message`)
        .query({
          author_handle: authorSeed.author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      expect(res2.body.messages).to.be.an('array')
        .that.contains.something.like({subject: messagePostObject.subject, from: authorSeed.author_two_handle, to: authorSeed.author_one_handle})

    });

    it.skip(`Should respond to a survey`, async function () {
      const seeder = require('../database/seeds/12_survey_1');
      seeder.seed();

      const messagePostObject = {
        author_handle: seeder.survey_recipient_id,
        recipient_handle: seeder.survey_author_id,
        parent_message_id: seeder.survey_message_id,
        survey_reponse: [],
        composed_at: new Date().toISOString()
      }
      await request(server)
      .post(`/message`)
      .send(messagePostObject)
      .set('Accept', 'application/json')
      .expect(204);

    });

    it.skip(`Should respond to an announce message`, async function () {
      expect(false).to.be.true;
    });
  });


  describe('Bulk Message POST resource creation', () => {

    it(`Should send an announce message to an organization`, async function () {
      const messageSendPostObject = {
        author_handle: authorSeed.author_one_handle,
        subject: uuid(),
        body: 'This is an announcement to come pick up some trees',
        organization_id
      }

      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            grower_accounts: [
              { wallet: authorSeed.author_two_handle },
            ],
          },
        };
      });

      await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);
      
      axiosStub.restore();

      const res = await request(server)
        .get(`/message`)
        .query({
          author_handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      expect(res.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: authorSeed.author_one_handle, to: null });

      const res2 = await request(server)
        .get(`/message`)
        .query({
          author_handle: authorSeed.author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      expect(res2.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: authorSeed.author_one_handle, to: authorSeed.author_two_handle })
    });

    it(`Should send an announce message to multiple recipients in an organization`, async function () {
      const messageSendPostObject = {
        author_handle: authorSeed.author_one_handle,
        subject: uuid(),
        body: 'This is an announcement to come pick up some trees',
        organization_id
      }

      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            grower_accounts: [
              { wallet: authorSeed.author_two_handle },
              { wallet: authorSeed.author_three_handle },
              { wallet: authorSeed.author_four_handle }
            ],
          },
        };
      });

      await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);

      axiosStub.restore();

      const res = await request(server)
        .get(`/message`)
        .query({
          author_handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      expect(res.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: authorSeed.author_one_handle, to: null });

      const res2 = await request(server)
        .get(`/message`)
        .query({
          author_handle: authorSeed.author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      expect(res2.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: authorSeed.author_one_handle, to: authorSeed.author_two_handle })

      const res3 = await request(server)
        .get(`/message`)
        .query({
          author_handle: authorSeed.author_three_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      expect(res3.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: authorSeed.author_one_handle, to: authorSeed.author_three_handle })

      const res4 = await request(server)
        .get(`/message`)
        .query({
          author_handle: authorSeed.author_four_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
      expect(res4.body.messages).to.be.an('array')
        .that.contains.something.like({ subject: messageSendPostObject.subject, from: authorSeed.author_one_handle, to: authorSeed.author_four_handle })
    });


    it(`Should send a survey message`, async function () {
      const messageSendPostObject = {
        author_handle: authorSeed.author_one_handle,
        subject: uuid(),
        body: 'This is a survey about trees',
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

      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            grower_accounts: [
              { wallet: authorSeed.author_two_handle },
            ],
          },
        };
      });

      await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);

      axiosStub.restore();

      const res = await request(server)
        .get(`/message`)
        .query({
          author_handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)

      console.log(res.body.messages);
      expect(res.body.messages).to.be.an('array')
        .that.contains.something.like({ from: authorSeed.author_one_handle, to: null, survey: { title: messageSendPostObject.survey.title } });
    });

    it(`Send a survey message and recipient should recieve it`, async function () {
      const messageSendPostObject = {
        author_handle: authorSeed.author_one_handle,
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

      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            grower_accounts: [
              { wallet: authorSeed.author_two_handle },
            ],
          },
        };
      });

      await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);

      axiosStub.restore();

      const res = await request(server)
        .get(`/message`)
        .query({
          author_handle: authorSeed.author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)

      console.log(res.body.messages);
      expect(res.body.messages).to.be.an('array')
        .that.contains.something.like({ from: authorSeed.author_one_handle, to: authorSeed.author_two_handle, survey: { title: messageSendPostObject.survey.title } });
        
    });
  });

  

  describe('Message GET', () => {
    it(`Should get messages successfully`, function (done) {

      // run a knex seed here
      // const seeder = require('database/seeds/02_conversation_1');
      // seeder.seed();

      request(server)
        .get(`/message`)
        .query({
          author_handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200)
        .end(function (err, res) {
          if (err) {
            console.log(err)
            return done(err);
          }
          expect(res.body).to.have.keys(['messages', 'links']);
          expect(res.body.links).to.have.keys(['prev', 'next']);

          // test if surveys were added successfully
          // TODO: do not check for data inserted by previous tests
          // TODO: tests should be atomic, not interdependent.
          const messageSendPostObject = new MessageSendPostObject();

          // let survey_one_exists = false;
          // const survey_two_exists = false;
          for (const message of res.body.messages) {
            // console.log("returned message");
            console.log(message);
            expect(message).to.include.keys([
              'id',
              'type',
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
                // survey_one_exists = true;
                expect(survey.questions).eql(
                  messageSendPostObject._object.survey.questions,
                );
              }
              console.log(survey.title);
              console.log(res.body.messages.length);
              // if (survey.title === survey_title) survey_two_exists = true;
            }
          }

          // expect(survey_one_exists).to.be.true;
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
