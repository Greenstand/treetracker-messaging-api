const { v4: uuid } = require('uuid');
const Chance = require('chance');

const chance = new Chance();

const authorSeed = require('./01_table_author');

const messageId1 = uuid();
const messageId2 = uuid();
const messageId3 = uuid();


const fakeMessageContent = function (authorId) {
  return {
    type: 'message',
    author_id: authorId,
    subject: '',
    body: chance.sentence(),
    composed_at: '2022-01-22',
  }
}

const seed = async function (knex) {
  // Author table is globally populated
  {
    const contentId = (await knex('content')
      .insert(fakeMessageContent(authorSeed.author_one_id))
      .returning('id'))[0];

    const message = {
      id: messageId1,
      content_id: contentId,
      sender_id: authorSeed.author_one_id,
      recipient_id: authorSeed.author_two_id,
    };
    await knex('message').insert(message).returning('id');
  }

  {
    const contentId = (await knex('content')
    .insert(fakeMessageContent(authorSeed.author_one_id))
    .returning('id'))[0];

    const message = {
      id: messageId2,
      content_id: contentId,
      sender_id: authorSeed.author_one_id,
      recipient_id: authorSeed.author_three_id,
    };
    await knex('message').insert(message).returning('id');
  }

  {
    const contentId = (await knex('content')
    .insert(fakeMessageContent(authorSeed.author_one_id))
    .returning('id'))[0];

    const message = {
      id: messageId3,
      content_id: contentId,
      sender_id: authorSeed.author_one_id,
      recipient_id: authorSeed.author_four_id,
    };
    await knex('message').insert(message).returning('id');
  }

}

module.exports = {
  seed,
  messageId1,
  messageId2,
  messageId3
}