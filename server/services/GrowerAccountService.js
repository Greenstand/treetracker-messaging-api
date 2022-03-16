const axios = require('axios').default;
const log = require('loglevel');

const TREETRACKER_GROWER_ACCOUNT_QUERY_API_URL =
  process.env.TREETRACKER_GROWER_ACCOUNT_QUERY_API_URL ||
  'http://treetracker-grower-account-query.query/';

const growerAccountUrl = `${TREETRACKER_GROWER_ACCOUNT_QUERY_API_URL}/grower_accounts`;

const getGrowerAccountWalletsForOrganization = async (organization_id) => {
  const url = `${growerAccountUrl}?organization_id=${organization_id}`;
  log.info(url);
  const response = await axios.get(
    url
  );

  const { grower_accounts } = response.data;
  return grower_accounts
    ? grower_accounts.filter((row) => row.handle).map((row) => row.handle)
    : [];
};

const getGrowerAccountWalletsForRegion = async (region_id) => {
  const response = await axios.get(
    `${growerAccountUrl}?region_id=${region_id}`,
  );
  const { grower_accounts } = response.data;
  return grower_accounts.filter((row) => row.wallet).map((row) => row.wallet);
};

module.exports = {
  getGrowerAccountWalletsForOrganization,
  getGrowerAccountWalletsForRegion,
};
