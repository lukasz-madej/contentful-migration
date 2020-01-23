require('dotenv').config();

const contentful = require('contentful-management');

const client = contentful.createClient({
  accessToken: process.env.CTF_MANAGEMENT_ACCESS_TOKEN
});

const getAllEnvironments = () => client.getSpace(process.env.CTF_SPACE_ID)
  .then((space) => space.getEnvironments())
  .then((response) => response.items.map((environment) => environment.sys.id));

const checkIfEnvironmentExists = (environmentId) => getAllEnvironments()
  .then(environments => environments.includes(environmentId));

module.exports = {
  client,
  getAllEnvironments,
  checkIfEnvironmentExists
};
