const log = require('loglevel');
const axios = require('axios').default;

const TREETRACKER_STAKEHOLDER_API_URL =
  'http://treetracker-stakeholder-api.stakeholder-api/';

const getOrganizationName = async (organizationId) => {
  log.info('get org name');
  const stakeholderUrl = `${TREETRACKER_STAKEHOLDER_API_URL}/stakeholders`;
  const queryUrl = `${stakeholderUrl}?id=${organizationId}`
  const organizationResponse = await axios.get(queryUrl);
  return organizationResponse.data.stakeholders[0]?.org_name ?? organizationId;
};

module.exports = {
  getOrganizationName,
};
