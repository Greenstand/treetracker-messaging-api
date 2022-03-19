const log = require('loglevel');
const Session = require('../models/Session');
const Message = require('../models/Message');
const HttpError = require('../utils/HttpError');

const GrowerAccountService = require('./GrowerAccountService');
const StakeholderService = require('./StakeholderService');
const RegionService = require('./RegionService');

const getMessages = async (filter) => {
  const session = new Session();
  const messages = await Message.getMessages(session, filter);
  log.trace(messages);
  const messagesWithRecipientInfo = await Promise.all(
    messages.map(async (row) => {
      const newRow = { ...row };
      if (row.recipient_organization_id || row.region_id) {
        newRow.bulk_message_recipients = [];
        const recipient = {};

        if (row.recipient_organization_id) {
          log.debug('contacting stakeholder');
          const orgName = await StakeholderService.getOrganizationName(
            row.recipient_organization_id,
          );
          recipient.organization = orgName;
        }

        if (row.recipient_region_id) {
          log.debug('contacting regions');
          const regionName = await RegionService.getRegionName(
            row.recipient_region_id
          );
          recipient.region = regionName;
        }

        newRow.bulk_message_recipients.push(recipient);
      }
      return newRow;
    }),
  );
  log.trace(messagesWithRecipientInfo);

  return messagesWithRecipientInfo;
};

const createMessage = async (body) => {
  const session = new Session();
  try {
    await session.beginTransaction();
    await Message.createMessage(session, body);
    await session.commitTransaction();
  } catch (e) {
    log.info('Error:');
    log.info(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    throw e;
  }
};

const createBulkMessage = async (body) => {
  const session = new Session();
  try {
    await session.beginTransaction();
    let recipientHandles = [];
    if (body.organization_id || body.region_id) {
      recipientHandles =
        await GrowerAccountService.getGrowerAccountWalletsForOrganizationAndRegion(
          body.organization_id,
          body.region
        );

      if (recipientHandles.length < 1) {
        let errorMessage = 'Error';
        if (body.organization_id && body.region_id){
          errorMessage = 'No author handle found in the specified organization and region';
        } else if (body.organization_id){
          errorMessage = 'No author handle found in the specified organization';
        } else if (body.region_id){
          errorMessage = 'No author handle found in the specified region';
        }
        throw new HttpError(
          422,
          errorMessage,
        );
      }
    }

    await Message.createBulkMessage(session, body, [
      ...recipientHandles
    ]);
    await session.commitTransaction();
  } catch (e) {
    log.info('Error:');
    log.info(e);
    if (session.isTransactionInProgress()) {
      await session.rollbackTransaction();
    }
    throw e;
  }
};

const getMessagesCount = async (filter) => {
  const session = new Session();
  const messagesCount = await Message.getMessagesCount(session, filter);

  return messagesCount;
};

module.exports = {
  getMessages,
  createMessage,
  createBulkMessage,
  getMessagesCount,
};
