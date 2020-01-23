require('dotenv').config();

const { checkIfEnvironmentExists } = require('./helpers');
const { filterFiles } = require('../helpers');
const { errorPath, dateTimeFormat } = require('../config');

const contentfulImport = require('contentful-import');
const fs = require('fs');
const util = require('util');
const moment = require('moment');

const importEnvironment = async (environmentId, path) => {
  if (await checkIfEnvironmentExists(environmentId)) {
    const fileName = await getImportFile(path);
    const errorLogFileName = moment().format(dateTimeFormat);
    const importOptions = {
      spaceId: process.env.CTF_SPACE_ID,
      managementToken: process.env.CTF_MANAGEMENT_ACCESS_TOKEN,
      environmentId,
      useVerboseRenderer: true,
      errorLogFile: `${errorPath}/error_${errorLogFileName}.log`,
      contentFile: `${path}/${fileName}`
    };

    return contentfulImport(importOptions)
      .catch(() => {});
  }
};

const getImportFile = async (path) => {
  const readdir = util.promisify(fs.readdir);

  return readdir(path).then((files) => filterFiles(files, path)[0])
}

module.exports = {
  importEnvironment
};
