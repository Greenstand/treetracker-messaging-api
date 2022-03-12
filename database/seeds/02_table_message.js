const Chance = require('chance');

const chance = new Chance();
const authorSeed = require('./01_table_author');

//
// Create author data in the database
//
const seed = async function (knex) {

  for (let i = 0; i < 200; i += 1) {
    const contentOfFirstMessage = {
      type: 'message',
      author_id: authorSeed.author_one_id,
      body: chance.sentence({ words: 5 }),
      composed_at: chance.date({ year: 2022 }).toISOString(),
    };
    const firstContentId = (await knex('content')
      .insert(contentOfFirstMessage)
      .returning('id'))[0];

    const firstMessage = {
      content_id: firstContentId,
      recipient_id: authorSeed.author_three_id,
      sender_id: authorSeed.author_one_id,
    };
    await knex('message').insert(firstMessage).returning('id');
  }

};

module.exports = {
  seed,
};
