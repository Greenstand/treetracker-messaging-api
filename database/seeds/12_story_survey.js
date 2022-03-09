const { v4: uuid } = require('uuid');
const authorSeed = require('./01_table_author');

const recipientId = authorSeed.author_two_id;
const recipientId2 = authorSeed.author_three_id;
const recipientId3 = authorSeed.author_four_id;
const authorId = authorSeed.author_one_id;
const messageId = uuid();
const surveyId = uuid();
const title = 'Number of trees planted today';

const seed = async function (knex) {

  const survey = {
    id: surveyId,
    title,
  }
  await knex('survey').insert(survey).returning('id');

  const surveyQuesetion1 = {
    survey_id: surveyId,
    prompt: 'How many trees did you plant today?',
    rank: 1,
    choices: ['1', '10', '1000']
  }
  await knex('survey_question').insert(surveyQuesetion1)

  {
    const content = {
      type: 'survey',
      author_id: authorId,
      subject: 'Number of trees planted today',
      survey_id: surveyId,
      composed_at: '2022-01-22',
    };
    const contentId = (await knex('content')
      .insert(content)
      .returning('id'))[0];

    {
      const message = {
        id: messageId,
        content_id: contentId,
        sender_id: authorId,
        recipient_id: recipientId,
      };
      await knex('message').insert(message).returning('id');
    }

    {
      const message = {
        id: uuid(),
        content_id: contentId,
        sender_id: authorId,
        recipient_id: recipientId2,
      };
      await knex('message').insert(message).returning('id');
    }

    {
      const message = {
        id: uuid(),
        content_id: contentId,
        sender_id: authorId,
        recipient_id: recipientId3,
      };
      await knex('message').insert(message).returning('id');
    }
  }

  {
    const content = {
      type: 'survey_response',
      author_id: recipientId,
      subject: 'Number of trees planted today',
      survey_id: surveyId,
      survey_response: JSON.stringify(['1']),
      composed_at: '2022-01-22',
    };
    const contentId = (await knex('content')
      .insert(content)
      .returning('id'))[0];

    const message = {
      id: uuid(),
      content_id: contentId,
      sender_id: recipientId,
      recipient_id: authorId,
    };
    await knex('message').insert(message).returning('id');
  }

  {
    const content = {
      type: 'survey_response',
      author_id: recipientId2,
      subject: 'Number of trees planted today',
      survey_id: surveyId,
      survey_response: JSON.stringify(['10']),
      composed_at: '2022-01-22',
    };
    const contentId = (await knex('content')
      .insert(content)
      .returning('id'))[0];

    const message = {
      id: uuid(),
      content_id: contentId,
      sender_id: recipientId2,
      recipient_id: authorId,
    };
    await knex('message').insert(message).returning('id');
  }

  {
    const content = {
      type: 'survey_response',
      author_id: recipientId3,
      subject: 'Number of trees planted today',
      survey_id: surveyId,
      survey_response: JSON.stringify(['1000']),
      composed_at: '2022-01-22',
    };
    const contentId = (await knex('content')
      .insert(content)
      .returning('id'))[0];

    const message = {
      id: uuid(),
      content_id: contentId,
      sender_id: recipientId3,
      recipient_id: authorId,
    };
    await knex('message').insert(message).returning('id');
  }
}

module.exports = {
  seed,
  authorHandle: authorSeed.author_one_handle,
  recipientHandle: authorSeed.author_two_handle,
  messageId,
  surveyId,
  title,
}