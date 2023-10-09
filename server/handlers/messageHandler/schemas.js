const Joi = require("joi");

const bulkMessagePostSchema = Joi.object({
  parent_message_id: Joi.string().uuid(),
  region_id: Joi.string().uuid(),
  organization_id: Joi.string().uuid(),
  author_handle: Joi.string().required(),
  subject: Joi.string().required(),
  body: Joi.string(),
  type: Joi.string().required().valid('announce', 'survey'),
  video_link: Joi.string().allow(null, '').uri(),
  survey: Joi.object({
    questions: Joi.array()
      .max(3)
      .items(
        Joi.object({
          prompt: Joi.string().required(),
          choices: Joi.array().items(Joi.string()).required(),
        }).unknown(false),
      )
      .required(),
    title: Joi.string().required(),
  }).unknown(false),
})
  .unknown(false)
  .oxor('recipient_handle', 'region_id')
  .oxor('recipient_handle', 'organization_id');

const messagePostSchema = Joi.object({
  id: Joi.string().uuid(),
  parent_message_id: Joi.string().uuid().allow(null),
  recipient_handle: Joi.string(),
  author_handle: Joi.string().required(),
  type: Joi.string().required().valid('message', 'survey_response'),
  body: Joi.string().allow(null, ''),
  survey_id: Joi.string().uuid().allow(null),
  survey_response: Joi.array().items(Joi.string().allow(null)).allow(null),
  video_link: Joi.string().allow(null, '').uri(),
  composed_at: Joi.date().iso().allow(null),
  bulk_pack_file_name: Joi.string(),
}).unknown(false);

const messageGetQuerySchema = Joi.object({
  handle: Joi.string().required(),
  limit: Joi.number().integer().greater(0).less(501),
  offset: Joi.number().integer().greater(-1),
  since: Joi.date().iso(),
  sort_by: Joi.string().allow('composed_at'),
  order: Joi.string().allow('desc', 'asc'),
}).unknown(false);

const messageSingleGetQuerySchema = Joi.object({
  message_id: Joi.string().uuid(),
});

module.exports = {
  bulkMessagePostSchema,
  messagePostSchema,
  messageGetQuerySchema,
  messageSingleGetQuerySchema,
};