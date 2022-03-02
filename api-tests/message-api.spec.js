require('dotenv').config();
const chai = require('chai');
const log = require('loglevel');

const { expect } = chai;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
const sinon = require('sinon');
const axios = require('axios').default;

const { v4: uuid } = require('uuid');

const request = require('./lib/supertest');
const server = require('../server/app');
const knex = require('../server/database/knex');

// Mock Data
const databaseCleaner = require('../database/seeds/00_job_database_cleaner');
const authorSeed = require('../database/seeds/01_table_author');

const stubStakeholder = (stakeholderPayload) => {
  return sinon.stub(axios, 'get').callsFake(async (_url) => {
    return {
      data: {
        stakeholders: [stakeholderPayload],
      },
    };
  });
};

describe('Message API tests.', () => {
  before(async function () {
    await databaseCleaner.seed(knex);
    await authorSeed.seed(knex);
  });

  describe('Message POST Resource Creation', () => {
    it(`Should create a message `, async function () {
      const messagePostObject = {
        recipient_handle: authorSeed.author_two_handle,
        author_handle: authorSeed.author_one_handle,
        subject: uuid(),
        body: 'Bodyyy',
        composed_at: new Date().toISOString(),
      };
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
      };
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
      };

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
        composed_at: new Date().toISOString(),
      };
      await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(204);

      const res = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);
      log.debug(res.body);
      expect(res.body.messages).to.be.an('array').that.contains.something.like({
        subject: messagePostObject.subject,
        from: authorSeed.author_two_handle,
        to: authorSeed.author_one_handle,
      });

      const res2 = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);
      expect(res2.body.messages)
        .to.be.an('array')
        .that.contains.something.like({
          subject: messagePostObject.subject,
          from: authorSeed.author_two_handle,
          to: authorSeed.author_one_handle,
        });
    });

    it(`Should respond to a survey`, async function () {
      const surveySeed = require('../database/seeds/12_story_survey');
      await surveySeed.seed(knex);

      const messagePostObject = {
        author_handle: surveySeed.recipientHandle,
        recipient_handle: surveySeed.authorHandle,
        parent_message_id: surveySeed.messageId,
        subject: 'Survey response',
        survey_id: surveySeed.surveyId,
        survey_response: ['1'],
        composed_at: new Date().toISOString(),
      };
      await request(server)
        .post(`/message`)
        .send(messagePostObject)
        .set('Accept', 'application/json')
        .expect(204);

      const res = await request(server)
        .get(`/message`)
        .query({
          handle: surveySeed.authorHandle,
        })
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body.messages)
        .to.be.an('array')
        .that.contains.something.like({
          from: surveySeed.recipientHandle,
          to: surveySeed.authorHandle,
          survey: {
            answers: ['1'],
          },
        });
    });

    it(`Should  get an announce message`, async function () {
      const announceSeed = require('../database/seeds/11_story_announce');
      await announceSeed.seed(knex);

      const axiosStub = stubStakeholder({
        org_name: announceSeed.organizationName,
      });

      const res = await request(server)
        .get(`/message`)
        .query({
          handle: announceSeed.recipientHandle,
        })
        .set('Accept', 'application/json')
        .expect(200);

      log.debug(res.body.messages);
      res.body.messages.forEach((it) => {
        log.debug(it.bulk_message_recipients);
      });

      axiosStub.restore();

      expect(res.body.messages)
        .to.be.an('array')
        .that.contains.something.like({
          from: announceSeed.authorHandle,
          to: announceSeed.recipientHandle,
          recipient_organization_id: announceSeed.organizationId,
          bulk_message_recipients: [
            {
              recipient: announceSeed.organizationName,
              type: 'organization',
            },
          ],
        });
    });
  });

  describe('Bulk Message POST resource creation', () => {
    it(`Should send an announce message to an organization`, async function () {
      const messageSendPostObject = {
        author_handle: authorSeed.author_one_handle,
        subject: uuid(),
        body: 'This is an announcement to come pick up some trees',
        organization_id: uuid(),
      };

      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            grower_accounts: [{ wallet: authorSeed.author_two_handle }],
          },
        };
      });

      await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);

      axiosStub.restore();

      const stakeholderStub = stubStakeholder({ org_name: 'Greenstand' });

      const res = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);

      const res2 = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);

      stakeholderStub.restore();

      expect(res.body.messages).to.be.an('array').that.contains.something.like({
        subject: messageSendPostObject.subject,
        from: authorSeed.author_one_handle,
        to: null,
      });

      expect(res2.body.messages)
        .to.be.an('array')
        .that.contains.something.like({
          subject: messageSendPostObject.subject,
          from: authorSeed.author_one_handle,
          to: authorSeed.author_two_handle,
        });
    });

    it(`Should send an announce message to multiple recipients in an organization`, async function () {
      const messageSendPostObject = {
        author_handle: authorSeed.author_one_handle,
        subject: uuid(),
        body: 'This is an announcement to come pick up some trees',
        organization_id: uuid(),
      };

      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            grower_accounts: [
              { wallet: authorSeed.author_two_handle },
              { wallet: authorSeed.author_three_handle },
              { wallet: authorSeed.author_four_handle },
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

      const stakeholderStub = stubStakeholder({ org_name: 'Greenstand' });

      const res = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);
      expect(res.body.messages).to.be.an('array').that.contains.something.like({
        subject: messageSendPostObject.subject,
        from: authorSeed.author_one_handle,
        to: null,
      });

      const res2 = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);
      expect(res2.body.messages)
        .to.be.an('array')
        .that.contains.something.like({
          subject: messageSendPostObject.subject,
          from: authorSeed.author_one_handle,
          to: authorSeed.author_two_handle,
        });

      const res3 = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_three_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);
      expect(res3.body.messages)
        .to.be.an('array')
        .that.contains.something.like({
          subject: messageSendPostObject.subject,
          from: authorSeed.author_one_handle,
          to: authorSeed.author_three_handle,
        });

      const res4 = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_four_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);
      expect(res4.body.messages)
        .to.be.an('array')
        .that.contains.something.like({
          subject: messageSendPostObject.subject,
          from: authorSeed.author_one_handle,
          to: authorSeed.author_four_handle,
        });

      stakeholderStub.restore();
    });

    it(`Should send a survey message`, async function () {
      const messageSendPostObject = {
        author_handle: authorSeed.author_one_handle,
        subject: uuid(),
        body: 'This is a survey about trees',
        organization_id: uuid(),
        survey: {
          questions: [
            {
              prompt: 'What is the capital of atlantis?',
              choices: ['konoha', "Bermuda's triangle"],
            },
          ],
          title: uuid(),
        },
      };

      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            grower_accounts: [{ wallet: authorSeed.author_two_handle }],
          },
        };
      });

      await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);

      axiosStub.restore();

      const stakeholderStub = stubStakeholder({ org_name: 'Greenstand' });

      const res = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);

      log.debug(res.body.messages);
      expect(res.body.messages)
        .to.be.an('array')
        .that.contains.something.like({
          from: authorSeed.author_one_handle,
          to: null,
          survey: {
            title: messageSendPostObject.survey.title,
            questions: [{ prompt: 'What is the capital of atlantis?' }],
          },
        });

      stakeholderStub.restore();
    });

    it(`Send a survey message and recipient should recieve it`, async function () {
      const messageSendPostObject = {
        author_handle: authorSeed.author_one_handle,
        subject: uuid(),
        body: 'This is an announcement to come pick up some trees',
        organization_id: uuid(),
        survey: {
          questions: [
            {
              prompt: 'What is the capital of atlantis?',
              choices: ['konoha', "Bermuda's triangle"],
            },
          ],
          title: uuid(),
        },
      };

      const axiosStub = sinon.stub(axios, 'get').callsFake(async (_url) => {
        return {
          data: {
            grower_accounts: [{ wallet: authorSeed.author_two_handle }],
          },
        };
      });

      await request(server)
        .post(`/bulk_message`)
        .send(messageSendPostObject)
        .set('Accept', 'application/json')
        .expect(204);

      axiosStub.restore();

      const stakeholderStub = stubStakeholder({ org_name: 'Greenstand' });

      const res = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_two_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);

      log.debug(res.body.messages);
      expect(res.body.messages)
        .to.be.an('array')
        .that.contains.something.like({
          from: authorSeed.author_one_handle,
          to: authorSeed.author_two_handle,
          survey: { title: messageSendPostObject.survey.title },
        });

      stakeholderStub.restore();
    });
  });

  describe('Message GET', () => {
    let messagesSeed;

    before(async function () {
      messagesSeed = require('../database/seeds/13_story_messages');
      await messagesSeed.seed(knex);
    });

    it(`Should get messages successfully`, async () => {
      const stakeholderStub = stubStakeholder({ org_name: 'Greenstand' });

      const res = await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);

      expect(res.body).to.have.keys(['messages', 'links']);
      expect(res.body.links).to.have.keys(['prev', 'next']);

      // let survey_one_exists = false;
      // const survey_two_exists = false;
      res.body.messages.forEach((message) => {
        // log.debug("returned message");
        log.debug(message);
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
        }
      });

      stakeholderStub.restore();
    });

    it('Should get messages with limit, offset', async () => {
      const stakeholderStub = stubStakeholder({ org_name: 'Greenstand' });

      await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_one_handle,
          limit: 1,
          offset: 1,
        })
        .set('Accept', 'application/json')
        .expect(200);

      // expect(res.body.links.prev).to.equal("")
      // expect(res.body.links.next).to.equal("")
      stakeholderStub.restore();
    });

    it('Should get messages without limit', async () => {
      const stakeholderStub = stubStakeholder({ org_name: 'Greenstand' });

      await request(server)
        .get(`/message`)
        .query({
          handle: authorSeed.author_one_handle,
        })
        .set('Accept', 'application/json')
        .expect(200);

      stakeholderStub.restore();
    });

    it('Get message by id', async () => {
      await request(server)
        .get(`/message/${messagesSeed.messageId1}`)
        .query({
          handle: authorSeed.author_one_handle,
        })
        .expect(200);
    });
  });
});
