const axios = require('axios').default;

const TREETRACKER_GROWER_ACCOUNT_QUERY_API_URL =
  process.env.TREETRACKER_API_URL ||
  'http://treetracker-grower-account-query.query/';

const growerAccountUrl = `${TREETRACKER_GROWER_ACCOUNT_QUERY_API_URL}/grower_accounts`;

const getGrowerAccountWalletsForOrganization = async (organization_id) => {
  // get grower_accounts in the specified organization from the treetracker-api
  const response = await axios.get(
    `${growerAccountUrl}?organization_id=${organization_id}`,
  );
  const { grower_accounts } = response.data;
  return grower_accounts
    ? grower_accounts.filter((row) => row.wallet).map((row) => row.wallet)
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
