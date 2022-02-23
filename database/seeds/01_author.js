const authors = require('./data/authors.json');

exports.seed = function (knex) {
  return knex('author').insert(authors);
};
