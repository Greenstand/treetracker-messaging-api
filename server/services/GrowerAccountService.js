const axios = require('axios').default;
const log = require('loglevel');

const TREETRACKER_GROWER_ACCOUNT_QUERY_API_URL =
  process.env.TREETRACKER_GROWER_ACCOUNT_QUERY_API_URL ||
  'http://treetracker-grower-account-query.query';

const growerAccountUrl = `${TREETRACKER_GROWER_ACCOUNT_QUERY_API_URL}/grower_accounts`;

const getGrowerAccountWalletsForOrganizationAndRegion = async (organization_id, region_id) => {
  let url = `${growerAccountUrl}?`;
  if(organization_id){
    url = `${url}organization_id=${organization_id}`
  }

  if(organization_id && region_id){
    url = `${url}&`;
  }

  if(region_id){
    url = `${url}region_id=${region_id}`;
  }

  log.info(url);
  const response = await axios.get(
    url
  );

  const { grower_accounts } = response.data;
  return grower_accounts
    ? grower_accounts.filter((row) => row.handle).map((row) => row.handle)
    : [];
};


module.exports = {
  getGrowerAccountWalletsForOrganizationAndRegion
};
