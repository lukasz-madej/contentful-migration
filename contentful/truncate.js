require('dotenv').config();

const { checkIfEnvironmentExists, client } = require('./helpers');

const prompts = require('prompts');

const truncateEnvironment = async (environmentId) => {
  if (await checkIfEnvironmentExists(environmentId)) {
    if (await checkConsent(environmentId)) {
      await client.getSpace(process.env.CTF_SPACE_ID)
        .then(space => space.getEnvironment(environmentId))
        .then(environment => environment.getEntries({ limit: 1000 }))
        .then(async (entries) => {
          for (const entry of entries.items) {
            await unpublishAndDeleteEntry(entry);
          }
          return Promise.resolve();
        })
        .catch(e => {
          return Promise.reject(e);
        });
      console.log('Entries delete compete!');

      await client.getSpace(process.env.CTF_SPACE_ID)
        .then(space => space.getEnvironment(environmentId))
        .then(environment => environment.getAssets({ limit: 1000 }))
        .then(async (assets) => {
          for (const asset of assets.items) {
            await unpublishAndDeleteAsset(asset);
          }
          return Promise.resolve();
        })
        .catch(e => {
          return Promise.reject(e);
        });
      console.log('Assets delete compete!');

      await client.getSpace(process.env.CTF_SPACE_ID)
        .then(space => space.getEnvironment(environmentId))
        .then(environment => environment.getContentTypes({ limit: 1000 }))
        .then(async (contentTypes) => {
          for (const contentType of contentTypes.items) {
            await unpublishAndDeleteContentType(contentType);
          }
          return Promise.resolve();
        })
        .catch(e => {
          return Promise.reject(e);
        });
      console.log('Content types delete compete!');

      await client.getSpace(process.env.CTF_SPACE_ID)
        .then(space => space.getEnvironment(environmentId))
        .then(environment => environment.getLocales())
        .then(async (locales) => {
          for (const locale of locales.items) {
            await deleteLocale(locale);
          }
          return Promise.resolve();
        })
        .catch(e => {
          return Promise.reject(e);
        });
      console.log('Locales delete compete!');
    }
  }
  return Promise.resolve();
};

const checkConsent = (environmentId) => {
  const isProduction = ['master', 'redesign'].includes(environmentId);
  const questions = [{
    type: 'confirm',
    name: 'consent',
    message: `This will delete all data from the ${environmentId} environment! Do you want to proceed?`,
    initial: false
  }, {
    type: prev => prev === true && isProduction ? 'confirm' : null,
    name: 'production',
    message: `This is a production environment! Do you really want to proceed?`,
    initial: false
  }];

  return prompts(questions)
    .then(response => isProduction ? response.consent && response.production : response.consent);
};

const unpublishAndDeleteEntry = async (entry) => {
  try {
    if (entry.isPublished()) {
      console.log(`Unpublishing entry ${entry.sys.id}`);
      await entry.unpublish();
    }
    console.log(`Deleting entry ${entry.sys.id}`);
    return entry.delete();
  } catch (e) {
    return Promise.reject(e);
  }
};

const unpublishAndDeleteContentType = async (contentType) => {
  try {
    if (contentType.isPublished()) {
      console.log(`Unpublishing content type ${contentType.sys.id}`);
      await contentType.unpublish();
    }
    console.log(`Deleting content type ${contentType.sys.id}`);
    return contentType.delete();
  } catch (e) {
    return Promise.reject(e);
  }
};

const unpublishAndDeleteAsset = async (asset) => {
  try {
    if (asset.isPublished()) {
      console.log(`Unpublishing asset ${asset.sys.id}`);
      await asset.unpublish();
    }
    console.log(`Deleting asset ${asset.sys.id}`);
    return asset.delete();
  } catch (e) {
    return Promise.reject(e);
  }
};

const deleteLocale = async (locale) => {
  try {
    console.log(`Deleting locale ${locale.sys.id}`);
    return locale.delete();
  } catch (e) {
    return Promise.reject(e);
  }
};

module.exports = {
  truncateEnvironment
};
