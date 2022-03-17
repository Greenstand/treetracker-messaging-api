const log = require('loglevel');
const axios = require('axios').default;

const TREETRACKER_REGION_API_URL =
  process.env.TREETRACKER_REGION_API_URL ||
  'http://treetracker-regions-api.regions-api';

const getRegionName = async (regionId) => {
  log.info('get org name');
  let regionsUrl = `${TREETRACKER_REGION_API_URL}/region`;
  regionsUrl = `${regionsUrl}/${regionId}`;
  log.info(regionsUrl);
  const regionResponse = await axios.get(regionsUrl);
  log.info(regionResponse.data);
  return regionResponse.data.region?.name ?? regionId;
};

module.exports = {
  getRegionName,
};
