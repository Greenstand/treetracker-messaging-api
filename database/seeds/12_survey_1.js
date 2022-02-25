const authorSeed = require('./01_table_author');

exports.seed = async function (knex) {
  const _authorId = knex('author')
    .where({ handle: authorSeed.author_one_handle })
    .pluck('id');
};
