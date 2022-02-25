
const axios = require('axios').default;

const getGrowerAccountWalletsForOrganization = async (organization_id) => {

  const growerAccountUrl = `${process.env.TREETRACKER_API_URL}/grower_accounts`; // this moves to the service

  // get grower_accounts in the specified organization from the treetracker-api
  const response = await axios.get(
    `${growerAccountUrl}?organization_id=${organization_id}`,
  );
  const { grower_accounts } = response.data;
  return grower_accounts.map((row) => {
    return row.wallet;
  });
}

module.exports = { getGrowerAccountWalletsForOrganization };
