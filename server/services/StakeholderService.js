const axios = require('axios').default;

const getOrganizationName = async (organizationId) => {
    log.info("get org name");
    const stakeholderUrl = `${process.env.TREETRACKER_STAKEHOLDER_API_URL}/stakeholders`;
    const organizationResponse = await axios.get(
      `${stakeholderUrl}?id=${organizationId}`,
    );
    return organizationResponse.data.stakeholders[0]?.name ?? organizationId;
}
 
module.exports = {
  getOrganizationName
}