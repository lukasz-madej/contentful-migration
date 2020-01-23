const { exportPath } = require('./config.json');

const fs = require('fs');

const filterDirectories = (files, path) =>
  files.filter((file) => fs.statSync(`${path}/${file}`).isDirectory())

const filterFiles = (files, path) =>
  files.filter((file) => !fs.statSync(`${path}/${file}`).isDirectory())

module.exports = {
  filterDirectories,
  filterFiles
}
