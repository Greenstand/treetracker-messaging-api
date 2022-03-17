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
    let orgRecipientHandles = [];
    if (body.organization_id) {
      orgRecipientHandles =
        await GrowerAccountService.getGrowerAccountWalletsForOrganization(
          body.organization_id,
        );

      if (orgRecipientHandles.length < 1) {
        throw new HttpError(
          422,
          'No author handle found in the specified organization',
        );
      }
    }

    let regionRecipientHandles = [];
    if (body.region_id) {
      regionRecipientHandles =
        await GrowerAccountService.getGrowerAccountWalletsForRegion(
          body.region_id,
        );

      if (regionRecipientHandles.length < 1) {
        throw new HttpError(
          422,
          'No author handle found in the specified region',
        );
      }
    }

    await Message.createBulkMessage(session, body, [
      ...orgRecipientHandles,
      ...regionRecipientHandles,
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
