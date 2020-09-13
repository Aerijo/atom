'use strict';

const childProcess = require('child_process');

const CONFIG = require('../config');

process.env.ELECTRON_CUSTOM_VERSION = CONFIG.appMetadata.electronVersion;

module.exports = async function(ci) {
  console.log('Installing script dependencies');
  await new Promise(resolve => {
    childProcess.execFile(
      CONFIG.getNpmBinPath(ci),
      ['--loglevel=error', ci ? 'ci' : 'install'],
      { env: process.env, cwd: CONFIG.scriptRootPath },
      () => resolve(),
    );
  });
  console.log('Installed script dependencies');
};
