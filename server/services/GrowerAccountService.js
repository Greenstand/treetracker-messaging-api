const axios = require('axios').default;

const TREETRACKER_GROWER_ACCOUNT_QUERY_API_URL =
<<<<<<< HEAD
  'http://treetracker-grower-account-query.query';
=======
  process.env.TREETRACKER_API_URL ||
  'http://treetracker-grower-account-query.query/';
>>>>>>> fix: allow local dev with env var for treetracker-api

const growerAccountUrl = `${TREETRACKER_GROWER_ACCOUNT_QUERY_API_URL}/grower_accounts`;

const getGrowerAccountWalletsForOrganization = async (organization_id) => {
  // get grower_accounts in the specified organization from the treetracker-api
  const response = await axios.get(
    `${growerAccountUrl}?organization_id=${organization_id}`,
  );
  const { growerAccounts } = response.data;
  return growerAccounts.filter((row) => row.handle).map((row) => row.handle);
};

const getGrowerAccountWalletsForRegion = async (region_id) => {
  const response = await axios.get(
    `${growerAccountUrl}?region_id=${region_id}`,
  );
  const { growerAccounts } = response.data;
  return growerAccounts.filter((row) => row.handle).map((row) => row.handle);
};

module.exports = {
  getGrowerAccountWalletsForOrganization,
  getGrowerAccountWalletsForRegion,
};
