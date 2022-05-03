const log = require('loglevel');
const Session = require('../models/Session');
const Message = require('../models/Message');
const HttpError = require('../utils/HttpError');

const GrowerAccountService = require('./GrowerAccountService');
const StakeholderService = require('./StakeholderService');
const RegionService = require('./RegionService');

class MessageService {
  constructor() {
    this._session = new Session();
    this._message = new Message(this._session);
  }

  async getMessages(filter, limitOptions) {
    const messages = await this._message.getMessages(filter, limitOptions);
    log.trace(messages);
    const messagesWithRecipientInfo = await Promise.all(
      messages.map(async (row) => {
        const newRow = { ...row };
        if (row.recipient_organization_id || row.recipient_region_id) {
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
              row.recipient_region_id,
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
  }

  async createMessage(body) {
    try {
      await this._session.beginTransaction();
      await this._message.createMessage(body);
      await this._session.commitTransaction();
    } catch (e) {
      log.info('Error:');
      log.info(e);
      if (this._session.isTransactionInProgress()) {
        await this._session.rollbackTransaction();
      }
      throw e;
    }
  }

  async createBulkMessage(body) {
    try {
      await this._session.beginTransaction();
      let recipientHandles = [];
      if (body.organization_id || body.region_id) {
        recipientHandles =
          await GrowerAccountService.getGrowerAccountWalletsForOrganizationAndRegion(
            body.organization_id,
            body.region,
          );

        if (recipientHandles.length < 1) {
          let errorMessage = 'Error';
          if (body.organization_id && body.region_id) {
            errorMessage =
              'No author handle found in the specified organization and region';
          } else if (body.organization_id) {
            errorMessage =
              'No author handle found in the specified organization';
          } else if (body.region_id) {
            errorMessage = 'No author handle found in the specified region';
          }
          throw new HttpError(422, errorMessage);
        }
      }

      await this._message.createBulkMessage(body, [...recipientHandles]);
      await this._session.commitTransaction();
    } catch (e) {
      log.info('Error:');
      log.info(e);
      if (this._session.isTransactionInProgress()) {
        await this._session.rollbackTransaction();
      }
      throw e;
    }
  }

  async getMessagesCount(filter) {
    return this._message.getMessagesCount(filter);
  }
}

module.exports = MessageService;
