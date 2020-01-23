require('dotenv').config();

const { checkIfEnvironmentExists } = require('./helpers');
const { exportPath, dateTimeFormat } = require('../config.json');
const { filterDirectories } = require('../helpers');

const contentfulExport = require('contentful-export')
const fs = require('fs');
const util = require('util');
const moment = require('moment');

const exportEnvironment = async (environmentId) => {
  if (await checkIfEnvironmentExists(environmentId)) {
    const mkdir = util.promisify(fs.mkdir);
    const exportDirName = moment().format(dateTimeFormat);
    const envDirExists = fs.existsSync(`${exportPath}/${environmentId}`);
    const exportOptions = {
      spaceId: process.env.CTF_SPACE_ID,
      managementToken: process.env.CTF_MANAGEMENT_ACCESS_TOKEN,
      environmentId,
      exportDir: `${exportPath}/${environmentId}/${exportDirName}`,
      downloadAssets: true,
      useVerboseRenderer: true,
      includeArchived: true
    };

    if (!envDirExists) {
      await mkdir(`${exportPath}/${environmentId}`);
    }
    await mkdir(`${exportPath}/${environmentId}/${exportDirName}`);

    return contentfulExport(exportOptions);
  }
};

const getExportedEnvironments = async () => {
  const readdir = util.promisify(fs.readdir);

  return readdir(exportPath).then((files) => filterDirectories(files, exportPath))
}

const getExports = async (environment) => {
  const readdir = util.promisify(fs.readdir);
  const path = `${exportPath}/${environment}`;

  return readdir(path).then((files) => filterDirectories(files, path))
}

module.exports = {
  exportEnvironment,
  getExportedEnvironments,
  getExports
};
