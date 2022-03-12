const Chance = require('chance');

const chance = new Chance();

//
// These constants can be exported to support other seeds and APIs
// Do not edit!
//
const author_one_id = '4395ce86-17b6-46de-a814-842f818d18ce';
const author_two_id = '4763f101-a915-4b86-871b-86714d45a889';
const author_three_id = '8356456a-1900-4089-98f0-d3565d71acff';
const author_four_id = 'e4938dc8-fea9-49a7-a143-8e21c1cbf597';
const author_one_handle = 'admin';
const author_two_handle = 'handle2';
const author_three_handle = 'handle3';
const author_four_handle = 'handle4';

//
// Create author data in the database
//
const seed = async function (knex) {
  const authorNumber = 10;
  const authors = [];
  for (let index = 0; index < authorNumber; index += 1) {
    authors.push({
      handle: chance.word(),
    });
  }
 
  authors.push({ id: author_one_id, handle: author_one_handle });
  authors.push({ id: author_two_id, handle: author_two_handle });
  authors.push({ id: author_three_id, handle: author_three_handle });
  authors.push({ id: author_four_id, handle: author_four_handle });

  for(let i=0; i<50; i += 1){
    authors.push({ handle: `wallet${i}` });
  }

  await knex('author').insert(authors);
};

module.exports = {
  seed,
author_one_id,
  author_two_id,
  author_three_id,
  author_four_id,
  author_one_handle,
  author_two_handle,
  author_three_handle,
  author_four_handle,
};
