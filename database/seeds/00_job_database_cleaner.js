exports.seed = async function (knex) {
 await knex.raw(`
    DELETE FROM bulk_message;
    DELETE FROM message;
    DELETE FROM content;
    DELETE FROM author;
    DELETE FROM survey_question;
    DELETE FROM survey;
  `);
};

