const log = require('loglevel');
const Session = require('../models/Session');
const Message = require('../models/Message');
const HttpError = require('../utils/HttpError');

const GrowerAccountService = require('./GrowerAccountService');
const StakeholderService = require('./StakeholderService');

const getMessages = async (filter) => {
  const session = new Session();
  const messages = await Message.getMessages(session, filter);
  log.trace(messages);
  const messagesWithRecipientInfo = await Promise.all(
    messages.map(async (row) => {
      const newRow = { ...row }
      if (row.recipient_organization_id || row.region_id) {
        newRow.bulk_message_recipients = [];
      }

      if (row.organization_id) {
        const orgName = StakeholderService.getOrganizationName(
          row.recipient_organization_id,
        );
        newRow.bulk_message_recipients.push({
          recipient: orgName,
          type: 'organization',
        });
      }

      // TODO: look up region name
      // if (row.recipient_region_id) {
      //   // get region name
      //   const session = new Session();
      //   const regionRepo = new RegionRepository(session);
      //   const regionInfo = await regionRepo.getById(row.recipient_region_id);

      //   bulk_message_recipients.push({ recipient: regionInfo.name, type: 'region' });
      // }

      return row;
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
    if (body.organization_id) {
      recipientHandles =
        await GrowerAccountService.getGrowerAccountWalletsForOrganization(
          body.organization_id,
        );
    }
    if (recipientHandles.length < 1) {
      throw new HttpError(
        422,
        'No grower accounts found in the specified organization',
      );
    }

    await Message.createBulkMessage(session, body, recipientHandles);
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

module.exports = { getMessages, createMessage, createBulkMessage };
