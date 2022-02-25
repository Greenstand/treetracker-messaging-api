const Chance = require('chance');

const chance = new Chance();
const { v4: uuid } = require('uuid');

//
// These constants can be exported to support other seeds and APIs
// Do not edit!
//
const author_one_id = uuid();
const author_one_handle = 'handle1';
const author_two_handle = 'handle2';
const author_three_handle = 'handle3';
const author_four_handle = 'handle4';

//
// Create author data in the database
//
const seed = async function (knex) {
  const authorNumber = 10;
  const authors = [];
  for (let index = 0; index < authorNumber; index++) {
    authors.push({
      handle: chance.word(),
    });
  }
  const adminAuthor = {
    handle: 'admin',
  };
  authors.push(adminAuthor);

  authors.push({ id: author_one_id, handle: author_one_handle });
  authors.push({ handle: author_two_handle });
  authors.push({ handle: author_three_handle });
  authors.push({ handle: author_four_handle });

  await knex('author').insert(authors);
};

module.exports = {
  seed,
  author_one_handle,
  author_two_handle,
  author_three_handle,
  author_four_handle,
  author_one_id,
};
