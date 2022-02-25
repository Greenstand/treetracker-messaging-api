const log = require('loglevel');
const Session = require('../models/Session');
const Message = require('../models/Message');
const HttpError = require('../utils/HttpError');

const GrowerAccountService = require('./GrowerAccountService');


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
    let recipientHandles = []
    if(body.organization_id) {
      recipientHandles = await GrowerAccountService.getGrowerAccountWalletsForOrganization(body.organization_id);
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
    throw(e);
  }
}

module.exports = { createMessage, createBulkMessage };
