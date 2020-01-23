const prompts  = require('prompts');
const chalk = require('chalk');
const loadingSpinner = require('loading-spinner');

const { getAllEnvironments } = require('./contentful/helpers');
const { exportEnvironment, getExportedEnvironments, getExports } = require('./contentful/export');
const { importEnvironment } = require('./contentful/import');
const { exportPath } = require('./config');

module.exports = async () => {
  console.log(chalk.bold('◍ Welcome to Contentful Migration Tool ◍'));

  await selectAction()
    .then(async (response) => {
      startLoading();

      const environments = await getAllEnvironments()
        .then((response) => {
          stopLoading();
          return response;
        });

      if (response.action) {
        switch (response.action) {
          case 'import':
            handleImport(environments);
            break;
          case 'export':
            handleExport(environments);
            break;
          case 'truncate':
            break;
        }
      }
    });
}

const handleExport = async (environments) => {
  await selectEnvironment(environments, 'Select source environment')
    .then(async (response) => {

      if (response.environment) {
        console.log(chalk.bold('→ Running contentful-export'));
        await exportEnvironment(response.environment);
      }
    })
}

const handleImport = async (environments) => {
  await selectEnvironment(environments, 'Select destination environment')
    .then(async (response) => {
      if (response.environment) {
        const destinationEnvironment = response.environment;
        const sourceEnvironments = await getExportedEnvironments();

        await selectEnvironment(sourceEnvironments, 'Select source environment [from exported data]')
          .then(async (response) => {
            if (response.environment) {
              const sourceEnvironment = response.environment;
              const sourceExports = await getExports(sourceEnvironment);

              await selectExport(sourceExports)
                .then(async (response) => {
                  if (response.export) {
                    const exportLocation = `${exportPath}/${sourceEnvironment}/${response.export}`;

                    console.log(chalk.bold('→ Running contentful-import'));
                    await importEnvironment(destinationEnvironment, exportLocation);
                  }
                })
            }
          })
      }
    })
}

const selectAction = () => {
  const question = {
    type: 'select',
    name: 'action',
    message: 'Select an action',
    choices: [
      { title: 'import', value: 'import' },
      { title: 'export', value: 'export' },
      // { title: 'truncate', value: 'truncate' }
    ]
  };

  return prompts(question);
}

const selectEnvironment = (environmentNames, message) => {
  const question = {
    type: 'select',
    name: 'environment',
    message,
    choices: environmentNames.map((environmentName) => {
      return {
        title: environmentName,
        value: environmentName
      }
    })
  };

  return prompts(question);
}

const selectExport = (exportNames) => {
  const question = {
    type: 'select',
    name: 'export',
    message: 'Select source export [from exported data]',
    choices: exportNames.map((exportName) => {
      return {
        title: exportName,
        value: exportName
      }
    })
  };

  return prompts(question);
}

const startLoading = () => {
  loadingSpinner.start(100, {
    clearChar: true
  });
}

const stopLoading = () => {
  loadingSpinner.stop();
}
